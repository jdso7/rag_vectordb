import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
   selector: 'app-context-history',
   standalone: true,
   imports: [CommonModule],
   template: `
    <div class="context-content">
      <div class="context-info">
        <p class="context-count">{{ llmHistory.length }} messages in context</p>
      </div>
      
      <div class="context-messages">
        <div *ngIf="llmHistory.length === 0" class="empty-context">
          No context yet. Start chatting to build conversation history.
        </div>
        <div *ngFor="let msg of llmHistory; let i = index" class="context-item">
          <div class="context-header">
            <span class="context-role">{{ msg.role === 'user' ? '👤 User' : '🤖 Assistant' }}</span>
            <span class="context-index">#{{ i + 1 }}</span>
          </div>
          <div class="context-content-text">{{ truncate(msg.content, 200) }}</div>
        </div>
      </div>
    </div>
  `,
   styles: [`
    .context-content {
      width: 100%;
    }

    .context-info {
      margin-bottom: 15px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .context-count {
      margin: 0;
      font-size: 14px;
      color: #495057;
      font-weight: 500;
    }

    .context-messages {
      max-height: 500px;
      overflow-y: auto;
    }

    .empty-context {
      text-align: center;
      color: #999;
      font-size: 14px;
      padding: 40px 20px;
      line-height: 1.6;
    }

    .context-item {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 10px;
      font-size: 13px;
      transition: background 0.2s;
    }

    .context-item:hover {
      background: #e9ecef;
    }

    .context-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .context-role {
      font-weight: 600;
      font-size: 13px;
      color: #495057;
    }

    .context-index {
      font-size: 11px;
      color: #999;
      font-family: monospace;
    }

    .context-content-text {
      color: #666;
      line-height: 1.5;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
  `]
})
export class ContextHistoryComponent {
   @Input() llmHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

   truncate(text: string, maxLength: number): string {
      if (text.length <= maxLength) {
         return text;
      }
      return text.substring(0, maxLength) + '...';
   }
}
