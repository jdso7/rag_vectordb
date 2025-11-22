import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class EmbeddingService {
   private readonly embeddingServiceUrl: string;

   constructor(private configService: ConfigService) {
      this.embeddingServiceUrl = this.configService.get<string>(
         'EMBEDDING_SERVICE_URL',
         'http://localhost:8001'
      );
   }

   async generateEmbedding(text: string): Promise<number[]> {
      try {
         const response = await axios.post(`${this.embeddingServiceUrl}/embed`, {
            inputs: text,
         });

         // The response format depends on the embedding service
         // text-embeddings-inference returns embeddings directly
         return response.data[0] || response.data;
      } catch (error) {
         console.error('Error generating embedding:', error.message);
         throw new Error(`Failed to generate embedding: ${error.message}`);
      }
   }

   async generateEmbeddings(texts: string[]): Promise<number[][]> {
      try {
         const response = await axios.post(`${this.embeddingServiceUrl}/embed`, {
            inputs: texts,
         });

         return response.data;
      } catch (error) {
         console.error('Error generating embeddings:', error.message);
         throw new Error(`Failed to generate embeddings: ${error.message}`);
      }
   }
}
