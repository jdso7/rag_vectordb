import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentsService } from '../documents/documents.service';
import OpenAI from 'openai';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RagService {
   private openai: OpenAI;
   private model: string;
   private ollamaUrl: string;
   private systemPromptWithContext: string;
   private systemPromptNoContext: string;
   private troubleshootingGuidelines: string;

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

      // Load system prompts from files
      const promptsDir = path.join(__dirname, '../../prompts');
      this.systemPromptWithContext = fs.readFileSync(
         path.join(promptsDir, 'system-prompt.txt'),
         'utf-8'
      );
      this.systemPromptNoContext = fs.readFileSync(
         path.join(promptsDir, 'system-prompt-no-context.txt'),
         'utf-8'
      );
      this.troubleshootingGuidelines = fs.readFileSync(
         path.join(promptsDir, 'troubleshooting-guidelines.txt'),
         'utf-8'
      );

      console.log(`RAG Service initialized with OpenAI model: ${this.model}`);
      console.log(`Ollama URL: ${this.ollamaUrl}`);
      console.log('System prompts loaded from files');
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
            systemPrompt = `${this.systemPromptNoContext}\n\n${this.troubleshootingGuidelines}`;
            userPrompt = question;
         } else {
            // Documents found - augment ChatGPT's knowledge with context
            const context = relevantDocs
               .map((doc) => `[${doc.metadata?.title || 'Untitled Document'}]\n${doc.content}`)
               .join('\n\n');

            systemPrompt = `${this.systemPromptWithContext}\n\n${this.troubleshootingGuidelines}`;
            userPrompt = `Question: ${question}\n\nContext from knowledge base:\n${context}`;
         }

         // 4. Query LLM based on provider
         let answer: string;
         let tokensUsed = 0;

         if (provider === 'llama') {
            // Query Ollama (Llama) - optimized for speed with conversation history
            let conversationContext = '';
            if (conversationHistory.length > 0) {
               // Take last 10 messages (5 exchanges) for context
               conversationContext = conversationHistory.slice(-10).map(msg =>
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
               ...conversationHistory.slice(-10), // Last 10 messages (5 exchanges) for context
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
            actualPrompt: userPrompt, // The actual prompt sent to LLM (with context if RAG mode)
            systemPrompt: systemPrompt, // The system prompt used
         };
      } catch (error) {
         console.error('Error in RAG query:', error);
         throw new Error(`RAG query failed: ${error.message}`);
      }
   }
}
