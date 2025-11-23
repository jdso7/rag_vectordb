import { Injectable } from '@nestjs/common';
import { ChromaService } from '../chroma/chroma.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { v4 as uuidv4 } from 'uuid';

export interface Document {
   id: string;
   content: string;
   metadata?: {
      title?: string;
      createdAt?: string;
      [key: string]: any;
   };
}

@Injectable()
export class DocumentsService {
   constructor(
      private chromaService: ChromaService,
      private embeddingService: EmbeddingService,
   ) { }

   async addDocument(content: string, title?: string): Promise<Document> {
      const id = uuidv4();
      const metadata = {
         title: title || `Document ${id.substring(0, 8)}`,
         createdAt: new Date().toISOString(),
      };

      // Generate embedding
      const embedding = await this.embeddingService.generateEmbedding(content);

      // Add to Chroma
      await this.chromaService.addDocument(id, content, embedding, metadata);

      return {
         id,
         content,
         metadata,
      };
   }

   async deleteDocument(id: string): Promise<{ success: boolean; id: string }> {
      return await this.chromaService.deleteDocument(id);
   }

   async updateDocument(
      id: string,
      content?: string,
      title?: string,
   ): Promise<Document> {
      // Get existing document
      const allDocs = await this.getAllDocuments();
      const existingDoc = allDocs.find(doc => doc.id === id);

      if (!existingDoc) {
         throw new Error(`Document with id ${id} not found`);
      }

      // Use new values or keep existing ones
      const updatedContent = content !== undefined ? content : existingDoc.content;
      const updatedTitle = title !== undefined ? title : existingDoc.metadata?.title;

      // Generate new embedding if content changed
      const embedding = content !== undefined
         ? await this.embeddingService.generateEmbedding(updatedContent)
         : null;

      const metadata = {
         ...existingDoc.metadata,
         title: updatedTitle,
         updatedAt: new Date().toISOString(),
      };

      // Update in Chroma (delete and re-add with same ID)
      await this.chromaService.deleteDocument(id);
      await this.chromaService.addDocument(
         id,
         updatedContent,
         embedding || await this.embeddingService.generateEmbedding(updatedContent),
         metadata,
      );

      return {
         id,
         content: updatedContent,
         metadata,
      };
   }

   async getAllDocuments(): Promise<Document[]> {
      const result = await this.chromaService.getAllDocuments();

      const documents: Document[] = [];
      for (let i = 0; i < result.ids.length; i++) {
         documents.push({
            id: result.ids[i],
            content: result.documents[i] || '',
            metadata: result.metadatas[i] || {},
         });
      }

      return documents;
   }

   async searchDocuments(query: string, nResults: number = 5) {
      // Generate query embedding
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Query Chroma
      const results = await this.chromaService.queryDocuments(queryEmbedding, nResults);

      const documents: Array<Document & { distance: number }> = [];
      for (let i = 0; i < results.ids.length; i++) {
         documents.push({
            id: results.ids[i],
            content: results.documents[i],
            metadata: results.metadatas[i] || {},
            distance: results.distances[i],
         });
      }

      return documents;
   }

   async getDocumentCount(): Promise<number> {
      return await this.chromaService.countDocuments();
   }
}
