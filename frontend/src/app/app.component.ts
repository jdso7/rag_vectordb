import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentManagerComponent } from './components/document-manager/document-manager.component';
import { RagChatComponent } from './components/rag-chat/rag-chat.component';
import { ContextHistoryComponent } from './components/context-history/context-history.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DocumentManagerComponent, RagChatComponent, ContextHistoryComponent],
  template: `
    <div class="app-container">
      <header class="header">
        <h1>🧠 RAG Vector DB Lab</h1>
        <p>Test Retrieval-Augmented Generation with Chroma & ChatGPT</p>
      </header>

      <div class="container">
        <div class="layout">
          <div class="panel">
            <app-document-manager></app-document-manager>
          </div>
          <div class="panel">
            <app-rag-chat (historyChange)="onHistoryChange($event)" (toggleHistory)="showHistory = !showHistory"></app-rag-chat>
          </div>
        </div>
      </div>

      <!-- Context History Modal -->
      <div *ngIf="showHistory" class="modal-overlay" (click)="showHistory = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>📋 Context History</h3>
            <button class="close-btn" (click)="showHistory = false">✕</button>
          </div>
          <div class="modal-body">
            <app-context-history [llmHistory]="currentHistory"></app-context-history>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .header {
      background: rgba(255, 255, 255, 0.95);
      padding: 30px 20px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header h1 {
      margin-bottom: 10px;
      color: #333;
    }

    .header p {
      color: #666;
      font-size: 16px;
    }

    .layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }

    .panel {
      min-height: 600px;
    }

    @media (max-width: 968px) {
      .layout {
        grid-template-columns: 1fr;
      }
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
      border-radius: 12px;
      max-width: 600px;
      max-height: 80vh;
      width: 90%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #dee2e6;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
      font-size: 20px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
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
  `]
})
export class AppComponent {
  title = 'RAG Vector DB Lab';
  currentHistory: Array<{ role: 'user' | 'assistant'; content: string; systemPrompt?: string }> = [];
  showHistory = false;

  onHistoryChange(history: Array<{ role: 'user' | 'assistant'; content: string; systemPrompt?: string }>) {
    this.currentHistory = history;
  }
}