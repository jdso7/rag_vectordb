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
          <div class="doc-main">
            <div class="doc-info" (click)="viewDocument(doc)">
              <div class="doc-header">
                <strong>{{doc.metadata?.title || 'Untitled'}}</strong>
                <span class="doc-date">{{formatDate(doc.metadata?.createdAt)}}</span>
              </div>
              <div class="doc-content">{{truncate(doc.content, 150)}}</div>
            </div>
            <span (click)="deleteDocument(doc.id)" class="action-icon delete-icon" title="Delete document">✕</span>
          </div>
        </div>
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{errorMessage}}
      </div>
    </div>

    <!-- Document Viewer Modal -->
    <div *ngIf="viewingDocument" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <input 
            *ngIf="isEditing" 
            [(ngModel)]="editTitle" 
            class="edit-title-input" 
            placeholder="Document title"
          />
          <h3 *ngIf="!isEditing" (click)="startEditing()" class="clickable-title">
            {{viewingDocument.metadata?.title || 'Untitled Document'}}
          </h3>
          <button class="close-btn" (click)="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="doc-meta" *ngIf="!isEditing">
            <span><strong>ID:</strong> {{viewingDocument.id}}</span>
            <span *ngIf="viewingDocument.metadata?.createdAt">
              <strong>Created:</strong> {{formatDate(viewingDocument.metadata?.createdAt)}}
            </span>
            <span *ngIf="viewingDocument.metadata && viewingDocument.metadata['updatedAt']">
              <strong>Updated:</strong> {{formatDate(viewingDocument.metadata['updatedAt'])}}
            </span>
          </div>
          <textarea 
            *ngIf="isEditing" 
            [(ngModel)]="editContent" 
            class="edit-content-textarea"
            rows="20"
          ></textarea>
          <div *ngIf="!isEditing" (click)="startEditing()" class="doc-full-content clickable-content">
            {{viewingDocument.content}}
          </div>
          <button 
            *ngIf="isEditing" 
            (click)="saveDocument()" 
            class="save-btn-bottom" 
            [disabled]="isSaving"
          >
            {{isSaving ? 'Saving...' : 'OK'}}
          </button>
        </div>
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
      padding: 12px;
      margin-bottom: 10px;
      background: #fafafa;
      transition: all 0.2s;
    }

    .document-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .doc-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      position: relative;
    }

    .doc-info {
      flex: 1;
      min-width: 0;
      cursor: pointer;
    }

    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      padding-right: 24px;
    }

    .doc-header strong {
      color: #333;
      font-size: 15px;
    }

    .doc-date {
      font-size: 11px;
      color: #999;
      white-space: nowrap;
    }

    .doc-content {
      color: #555;
      font-size: 13px;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .doc-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-shrink: 0;
    }

    .action-icon {
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s, color 0.2s;
      user-select: none;
      position: absolute;
      top: 0;
      right: 0;
    }

    .action-icon:hover {
      transform: scale(1.2);
    }

    .action-icon:active {
      transform: scale(1.0);
    }

    .delete-icon {
      color: #dc3545;
    }

    .delete-icon:hover {
      color: #c82333;
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 10px;
      border-radius: 5px;
      margin-top: 15px;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      max-width: 800px;
      max-height: 80vh;
      width: 90%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
      font-size: 20px;
      flex: 1;
    }

    .clickable-title {
      cursor: pointer;
      transition: color 0.2s;
    }

    .clickable-title:hover {
      color: #007bff;
    }

    .edit-title-input {
      flex: 1;
      padding: 8px 12px;
      font-size: 18px;
      font-weight: bold;
      border: 2px solid #007bff;
      border-radius: 4px;
      outline: none;
      margin-right: 20px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s, color 0.2s;
    }

    .close-btn:hover {
      background: #f0f0f0;
      color: #333;
    }

    .modal-body {
      padding: 20px;
      overflow-y: auto;
      flex: 1;
    }

    .doc-meta {
      display: flex;
      gap: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #666;
    }

    .doc-full-content {
      white-space: pre-wrap;
      line-height: 1.6;
      color: #333;
      font-size: 15px;
      padding: 10px;
      background: #fafafa;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
    }

    .clickable-content {
      cursor: pointer;
      transition: background 0.2s;
    }

    .clickable-content:hover {
      background: #f0f0f0;
    }

    .edit-content-textarea {
      width: 100%;
      padding: 12px;
      font-size: 15px;
      line-height: 1.6;
      border: 2px solid #007bff;
      border-radius: 6px;
      font-family: inherit;
      resize: vertical;
      outline: none;
      margin-bottom: 15px;
    }

    .save-btn-bottom {
      width: 100%;
      padding: 12px;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: background 0.2s;
    }

    .save-btn-bottom:hover:not(:disabled) {
      background: #218838;
    }

    .save-btn-bottom:disabled {
      background: #6c757d;
      cursor: not-allowed;
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
  viewingDocument: Document | null = null;
  isEditing = false;
  isSaving = false;
  editTitle = '';
  editContent = '';

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

  viewDocument(doc: Document) {
    this.viewingDocument = doc;
    this.isEditing = false;
  }

  closeModal() {
    this.viewingDocument = null;
    this.isEditing = false;
    this.editTitle = '';
    this.editContent = '';
  }

  startEditing() {
    if (this.viewingDocument) {
      this.isEditing = true;
      this.editTitle = this.viewingDocument.metadata?.title || '';
      this.editContent = this.viewingDocument.content;
    }
  }

  cancelEditing() {
    this.isEditing = false;
    this.editTitle = '';
    this.editContent = '';
  }

  saveDocument() {
    if (!this.viewingDocument) return;

    this.isSaving = true;
    this.errorMessage = '';

    this.apiService.updateDocument(
      this.viewingDocument.id,
      this.editContent,
      this.editTitle
    ).subscribe({
      next: (updatedDoc) => {
        // Update in local array
        const index = this.documents.findIndex(d => d.id === updatedDoc.id);
        if (index !== -1) {
          this.documents[index] = updatedDoc;
        }
        this.viewingDocument = updatedDoc;
        this.isEditing = false;
        this.isSaving = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to update document: ' + err.message;
        this.isSaving = false;
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
