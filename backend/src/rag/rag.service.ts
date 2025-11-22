import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentsService } from '../documents/documents.service';
import OpenAI from 'openai';
import axios from 'axios';

@Injectable()
export class RagService {
   private openai: OpenAI;
   private model: string;
   private ollamaUrl: string;

   constructor(
      private configService: ConfigService,
      private documentsService: DocumentsService,
   ) {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey) {
         console.warn('OPENAI_API_KEY not set. OpenAI queries will fail.');
      }
      this.openai = new OpenAI({ apiKey });
      this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
      this.ollamaUrl = this.configService.get<string>('OLLAMA_URL', 'http://localhost:11434');
      console.log(`RAG Service initialized with OpenAI model: ${this.model}`);
      console.log(`Ollama URL: ${this.ollamaUrl}`);
   }

   async query(
      question: string,
      contextLimit: number = 3,
      provider: string = 'openai',
      conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
   ): Promise<any> {
      try {
         // 1. Search for relevant documents
         const allDocs = await this.documentsService.searchDocuments(
            question,
            contextLimit,
         );

         // 2. Filter by relevance threshold (distance < 1.0 means more similar)
         // Lower distance = more similar. Typical thresholds: 0.5-1.5
         const relevanceThreshold = 1.2;
         const relevantDocs = allDocs.filter(doc => doc.distance < relevanceThreshold);

         // 3. Build context from retrieved documents (if any)
         let systemPrompt: string;
         let userPrompt: string;

         if (relevantDocs.length === 0) {
            // No relevant documents - use ChatGPT's knowledge only
            systemPrompt = `You are a helpful assistant. Answer questions using your knowledge. 
If you're not certain about something, acknowledge it.`;
            userPrompt = question;
         } else {
            // Documents found - augment ChatGPT's knowledge with context
            const context = relevantDocs
               .map((doc, idx) => `[Document ${idx + 1}]\n${doc.content}`)
               .join('\n\n');

            systemPrompt = `You are a helpful assistant that answers questions using both your general knowledge and the provided context from a knowledge base.

When answering:
1. Prioritize information from the provided documents when relevant
2. You can also use your general knowledge to provide comprehensive answers
3. If you use information from the documents, cite them (e.g., "According to Document 1...")
4. If the documents don't fully answer the question, supplement with your knowledge
5. Be clear about what comes from the documents vs. your general knowledge`;

            userPrompt = `Context from knowledge base:\n${context}\n\nQuestion: ${question}`;
         }

         // 4. Query LLM based on provider
         let answer: string;
         let tokensUsed = 0;

         if (provider === 'llama') {
            // Query Ollama (Llama) - optimized for speed with conversation history
            let conversationContext = '';
            if (conversationHistory.length > 0) {
               conversationContext = conversationHistory.slice(-5).map(msg =>
                  `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
               ).join('\n\n') + '\n\n';
            }

            const ollamaResponse = await axios.post(`${this.ollamaUrl}/api/generate`, {
               model: 'llama3.2',
               prompt: `${systemPrompt}\n\nConversation History:\n${conversationContext}${userPrompt}`,
               stream: false,
               options: {
                  temperature: 0.5,        // Lower = faster sampling
                  num_predict: 500,        // Max output tokens (less = faster)
                  num_ctx: 2048,           // Context window (smaller = faster)
                  top_k: 20,               // Smaller = faster
                  top_p: 0.9,              // Nucleus sampling
               },
            });

            answer = ollamaResponse.data.response || 'No answer generated.';
         } else {
            // Query OpenAI (ChatGPT) with conversation history
            const messages: any[] = [
               { role: 'system', content: systemPrompt },
               ...conversationHistory.slice(-5), // Last 5 messages for context
               { role: 'user', content: userPrompt },
            ];

            const completion = await this.openai.chat.completions.create({
               model: this.model,
               messages,
               temperature: 0.7,
               max_tokens: 800,
            });

            answer = completion.choices[0]?.message?.content || 'No answer generated.';
            tokensUsed = completion.usage?.total_tokens || 0;
         }

         return {
            answer,
            question,
            provider,
            sources: relevantDocs.map((doc) => ({
               id: doc.id,
               content: doc.content.substring(0, 200) + '...',
               title: doc.metadata?.title,
               distance: doc.distance,
            })),
            tokensUsed,
            mode: relevantDocs.length > 0 ? 'rag' : 'general',
         };
      } catch (error) {
         console.error('Error in RAG query:', error);
         throw new Error(`RAG query failed: ${error.message}`);
      }
   }
}
