import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Document {
   id: string;
   content: string;
   metadata?: {
      title?: string;
      createdAt?: string;
      [key: string]: any;
   };
}

export interface SearchResult extends Document {
   distance: number;
}

export interface RagResponse {
   answer: string;
   question: string;
   sources: Array<{
      id: string;
      content: string;
      title?: string;
      distance: number;
   }>;
   tokensUsed: number;
}

@Injectable({
   providedIn: 'root'
})
export class ApiService {
   private apiUrl = 'http://localhost:3000';

   constructor(private http: HttpClient) { }

   // Document operations
   addDocument(content: string, title?: string): Observable<Document> {
      return this.http.post<Document>(`${this.apiUrl}/documents`, { content, title });
   }

   getAllDocuments(): Observable<Document[]> {
      return this.http.get<Document[]>(`${this.apiUrl}/documents`);
   }

   deleteDocument(id: string): Observable<{ success: boolean; id: string }> {
      return this.http.delete<{ success: boolean; id: string }>(`${this.apiUrl}/documents/${id}`);
   }

   updateDocument(id: string, content?: string, title?: string): Observable<Document> {
      return this.http.put<Document>(`${this.apiUrl}/documents/${id}`, { content, title });
   }

   searchDocuments(query: string, limit: number = 5): Observable<SearchResult[]> {
      return this.http.post<SearchResult[]>(`${this.apiUrl}/documents/search`, { query, limit });
   }

   getDocumentCount(): Observable<{ count: number }> {
      return this.http.get<{ count: number }>(`${this.apiUrl}/documents/count`);
   }

   // RAG operations
   queryRag(
      question: string,
      contextLimit: number = 3,
      provider: string = 'openai',
      conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
   ): Observable<RagResponse> {
      return this.http.post<RagResponse>(`${this.apiUrl}/rag/query`, {
         question,
         contextLimit,
         provider,
         conversationHistory,
      });
   }
}
