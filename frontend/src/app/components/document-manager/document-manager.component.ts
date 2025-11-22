import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Document } from '../../services/api.service';

@Component({
   selector: 'app-document-manager',
   standalone: true,
   imports: [CommonModule, FormsModule],
   template: `
    <div class="card">
      <h2>📚 Document Manager</h2>
      
      <div class="stats">
        <span class="stat-badge">Total Documents: {{documentCount}}</span>
      </div>

      <div class="form-section">
        <h3>Add New Document</h3>
        <input 
          type="text" 
          [(ngModel)]="newDocTitle" 
          placeholder="Document title (optional)"
          class="input-field"
        />
        <textarea 
          [(ngModel)]="newDocContent" 
          placeholder="Enter document content..."
          rows="4"
          class="input-field"
        ></textarea>
        <button 
          (click)="addDocument()" 
          [disabled]="!newDocContent.trim() || isAdding"
          class="primary"
        >
          {{isAdding ? 'Adding...' : 'Add Document'}}
        </button>
      </div>

      <div class="documents-list">
        <h3>Stored Documents ({{documents.length}})</h3>
        <div class="refresh-bar">
          <button (click)="loadDocuments()" class="success" [disabled]="isLoading">
            {{isLoading ? 'Loading...' : '🔄 Refresh'}}
          </button>
        </div>

        <div *ngIf="documents.length === 0 && !isLoading" class="empty-state">
          No documents yet. Add some documents to get started!
        </div>

        <div *ngFor="let doc of documents" class="document-item">
          <div class="doc-header">
            <strong>{{doc.metadata?.title || 'Untitled'}}</strong>
            <span class="doc-date">{{formatDate(doc.metadata?.createdAt)}}</span>
          </div>
          <div class="doc-content">{{truncate(doc.content, 150)}}</div>
          <div class="doc-footer">
            <span class="doc-id">ID: {{doc.id.substring(0, 8)}}...</span>
            <button (click)="deleteDocument(doc.id)" class="danger">Delete</button>
          </div>
        </div>
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{errorMessage}}
      </div>
    </div>
  `,
   styles: [`
    h2 {
      margin-bottom: 20px;
      color: #333;
    }

    h3 {
      margin: 20px 0 10px 0;
      color: #555;
      font-size: 16px;
    }

    .stats {
      margin-bottom: 20px;
    }

    .stat-badge {
      display: inline-block;
      background: #e3f2fd;
      color: #1976d2;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }

    .form-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .input-field {
      margin-bottom: 10px;
    }

    .documents-list {
      max-height: 500px;
      overflow-y: auto;
    }

    .refresh-bar {
      margin-bottom: 15px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
      font-style: italic;
    }

    .document-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 10px;
      background: #fafafa;
      transition: all 0.2s;
    }

    .document-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .doc-header strong {
      color: #333;
      font-size: 15px;
    }

    .doc-date {
      font-size: 12px;
      color: #999;
    }

    .doc-content {
      color: #555;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 10px;
    }

    .doc-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .doc-id {
      font-size: 11px;
      color: #999;
      font-family: monospace;
    }

    button.danger {
      padding: 6px 12px;
      font-size: 12px;
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 10px;
      border-radius: 5px;
      margin-top: 15px;
    }
  `]
})
export class DocumentManagerComponent implements OnInit {
   documents: Document[] = [];
   newDocTitle = '';
   newDocContent = '';
   documentCount = 0;
   isLoading = false;
   isAdding = false;
   errorMessage = '';

   constructor(private apiService: ApiService) { }

   ngOnInit() {
      this.loadDocuments();
      this.loadDocumentCount();
   }

   loadDocuments() {
      this.isLoading = true;
      this.errorMessage = '';
      this.apiService.getAllDocuments().subscribe({
         next: (docs) => {
            this.documents = docs;
            this.isLoading = false;
         },
         error: (err) => {
            this.errorMessage = 'Failed to load documents: ' + err.message;
            this.isLoading = false;
         }
      });
   }

   loadDocumentCount() {
      this.apiService.getDocumentCount().subscribe({
         next: (result) => {
            this.documentCount = result.count;
         },
         error: (err) => {
            console.error('Failed to load document count:', err);
         }
      });
   }

   addDocument() {
      if (!this.newDocContent.trim()) return;

      this.isAdding = true;
      this.errorMessage = '';

      this.apiService.addDocument(this.newDocContent, this.newDocTitle || undefined).subscribe({
         next: (doc) => {
            this.documents.unshift(doc);
            this.newDocContent = '';
            this.newDocTitle = '';
            this.isAdding = false;
            this.documentCount++;
         },
         error: (err) => {
            this.errorMessage = 'Failed to add document: ' + err.message;
            this.isAdding = false;
         }
      });
   }

   deleteDocument(id: string) {
      if (!confirm('Are you sure you want to delete this document?')) return;

      this.apiService.deleteDocument(id).subscribe({
         next: () => {
            this.documents = this.documents.filter(d => d.id !== id);
            this.documentCount--;
         },
         error: (err) => {
            this.errorMessage = 'Failed to delete document: ' + err.message;
         }
      });
   }

   truncate(text: string, length: number): string {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
   }

   formatDate(dateString?: string): string {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
   }
}
