import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentManagerComponent } from './components/document-manager/document-manager.component';
import { RagChatComponent } from './components/rag-chat/rag-chat.component';

@Component({
   selector: 'app-root',
   standalone: true,
   imports: [CommonModule, DocumentManagerComponent, RagChatComponent],
   template: `
    <div class="app-container">
      <header class="header">
        <h1>🧠 RAG Vector DB Lab</h1>
        <p>Test Retrieval-Augmented Generation with Chroma & ChatGPT</p>
      </header>

      <div class="container">
        <div class="layout">
          <div class="left-panel">
            <app-document-manager></app-document-manager>
          </div>
          <div class="right-panel">
            <app-rag-chat></app-rag-chat>
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

    .left-panel, .right-panel {
      min-height: 600px;
    }

    @media (max-width: 968px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AppComponent {
   title = 'RAG Vector DB Lab';
}
