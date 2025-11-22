import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChromaClient, Collection } from 'chromadb';

@Injectable()
export class ChromaService implements OnModuleInit {
   private client: ChromaClient;
   private collection: Collection;
   private readonly collectionName = 'documents';

   constructor(private configService: ConfigService) { }

   async onModuleInit() {
      const chromaUrl = this.configService.get<string>('CHROMA_URL', 'http://localhost:8000');
      this.client = new ChromaClient({ path: chromaUrl });

      // Get or create collection
      try {
         this.collection = await this.client.getOrCreateCollection({
            name: this.collectionName,
            metadata: { description: 'RAG documents collection' },
         });
         console.log('Connected to Chroma collection:', this.collectionName);
      } catch (error) {
         console.error('Failed to initialize Chroma collection:', error);
         throw error;
      }
   }

   async addDocument(id: string, text: string, embedding: number[], metadata: any = {}) {
      try {
         await this.collection.add({
            ids: [id],
            embeddings: [embedding],
            documents: [text],
            metadatas: [metadata],
         });
         return { success: true, id };
      } catch (error) {
         console.error('Error adding document to Chroma:', error);
         throw error;
      }
   }

   async deleteDocument(id: string) {
      try {
         await this.collection.delete({ ids: [id] });
         return { success: true, id };
      } catch (error) {
         console.error('Error deleting document from Chroma:', error);
         throw error;
      }
   }

   async queryDocuments(queryEmbedding: number[], nResults: number = 5) {
      try {
         const results = await this.collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults,
         });

         return {
            documents: results.documents[0] || [],
            metadatas: results.metadatas[0] || [],
            distances: results.distances[0] || [],
            ids: results.ids[0] || [],
         };
      } catch (error) {
         console.error('Error querying Chroma:', error);
         throw error;
      }
   }

   async getAllDocuments() {
      try {
         const results = await this.collection.get({});
         return {
            ids: results.ids || [],
            documents: results.documents || [],
            metadatas: results.metadatas || [],
         };
      } catch (error) {
         console.error('Error getting all documents from Chroma:', error);
         throw error;
      }
   }

   async countDocuments(): Promise<number> {
      try {
         const count = await this.collection.count();
         return count;
      } catch (error) {
         console.error('Error counting documents:', error);
         return 0;
      }
   }
}
