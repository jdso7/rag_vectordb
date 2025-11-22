import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, RagResponse } from '../../services/api.service';

interface ChatMessage {
   type: 'user' | 'assistant';
   content: string;
   sources?: Array<{
      id: string;
      content: string;
      title?: string;
      distance: number;
   }>;
   tokensUsed?: number;
}

@Component({
   selector: 'app-rag-chat',
   standalone: true,
   imports: [CommonModule, FormsModule],
   template: `
    <div class="card">
      <h2>💬 RAG Chat</h2>
      <p class="subtitle">Ask questions about your documents using AI</p>

      <div class="provider-toggle">
        <label>
          <input type="radio" name="provider" value="openai" [(ngModel)]="selectedProvider" />
          <span class="provider-label">🤖 ChatGPT</span>
        </label>
        <label>
          <input type="radio" name="provider" value="llama" [(ngModel)]="selectedProvider" />
          <span class="provider-label">🦙 Llama (Local)</span>
        </label>
        <button *ngIf="messages.length > 0" (click)="clearChat()" class="clear-btn" title="Clear conversation">
          🗑️ Clear Chat
        </button>
      </div>

      <div class="chat-container">
        <div class="messages" #messagesContainer>
          <div *ngIf="messages.length === 0" class="empty-chat">
            <p>👋 Start a conversation!</p>
            <p class="hint">Ask questions about the documents you've added.</p>
          </div>

          <div *ngFor="let msg of messages" [class]="'message ' + msg.type">
            <div class="message-content">
              <div class="message-text">{{ msg.content }}</div>

              <div *ngIf="msg.sources && msg.sources.length > 0" class="sources">
                <div class="sources-header">📎 Sources:</div>
                <div *ngFor="let source of msg.sources" class="source-item">
                  <div class="source-title">{{ source.title || 'Untitled' }}</div>
                  <div class="source-content">{{ truncate(source.content, 100) }}</div>
                  <div class="source-meta">
                    Distance: {{ source.distance.toFixed(4) }}
                  </div>
                </div>
              </div>

              <div *ngIf="msg.tokensUsed" class="token-info">
                🔢 Tokens used: {{ msg.tokensUsed }}
              </div>
            </div>
          </div>

          <div *ngIf="isQuerying" class="message assistant typing">
            <div class="message-content">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="input-container">
          <textarea 
            [(ngModel)]="userQuestion"
            (keydown.enter)="onEnter($any($event))"
            placeholder="Ask anything! I'll use your documents if relevant, plus my general knowledge..."
            rows="2"
            [disabled]="isQuerying"
          ></textarea>
          <button
            (click)="sendQuery()"
            [disabled]="!userQuestion.trim() || isQuerying"
            class="primary"
          >
            {{ isQuerying ? 'Thinking...' : 'Send' }}
          </button>
        </div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
   styles: [`
    h2 {
      margin-bottom: 5px;
      color: #333;
    }

    .subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 15px;
    }

    .provider-toggle {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 8px;
      align-items: center;
    }

    .clear-btn {
      margin-left: auto;
      padding: 6px 12px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
    }

    .clear-btn:hover {
      background: #c82333;
    }

    .provider-toggle label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .provider-toggle input[type="radio"] {
      margin-right: 8px;
      width: auto;
    }

    .provider-label {
      font-size: 14px;
      font-weight: 500;
    }

    .chat-container {
      display: flex;
      flex-direction: column;
      height: 550px;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .empty-chat {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-chat .hint {
      font-size: 14px;
      margin-top: 10px;
    }

    .message {
      margin-bottom: 20px;
      display: flex;
    }

    .message.user {
      justify-content: flex-end;
    }

    .message.assistant {
      justify-content: flex-start;
    }

    .message-content {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .message.user .message-content {
      background: #007bff;
      color: white;
    }

    .message-text {
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .sources {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
    }

    .message.user .sources {
      border-top-color: rgba(255, 255, 255, 0.3);
    }

    .sources-header {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 10px;
      opacity: 0.8;
    }

    .source-item {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .message.user .source-item {
      background: rgba(255, 255, 255, 0.2);
    }

    .source-title {
      font-weight: 600;
      margin-bottom: 5px;
    }

    .source-content {
      color: #666;
      font-size: 12px;
      margin-bottom: 5px;
    }

    .message.user .source-content {
      color: rgba(255, 255, 255, 0.9);
    }

    .source-meta {
      font-size: 11px;
      color: #999;
      font-family: monospace;
    }

    .message.user .source-meta {
      color: rgba(255, 255, 255, 0.7);
    }

    .token-info {
      margin-top: 8px;
      font-size: 11px;
      opacity: 0.7;
    }

    .typing-indicator {
      display: flex;
      gap: 5px;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      background: #999;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-10px);
      }
    }

    .input-container {
      display: flex;
      gap: 10px;
      align-items: flex-end;
    }

    .input-container textarea {
      flex: 1;
      resize: none;
    }

    .input-container button {
      height: 46px;
      padding: 0 25px;
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 10px;
      border-radius: 5px;
      margin-top: 10px;
      font-size: 14px;
    }
  `]
})
export class RagChatComponent {
   messages: ChatMessage[] = [];
   userQuestion = '';
   selectedProvider = 'openai';
   isQuerying = false;
   errorMessage = '';

   constructor(private apiService: ApiService) { }

   sendQuery() {
      if (!this.userQuestion.trim() || this.isQuerying) {
         return;
      }

      const question = this.userQuestion.trim();
      this.userQuestion = '';
      this.errorMessage = '';
      this.isQuerying = true;

      // Add user message
      this.messages.push({
         type: 'user',
         content: question
      });

      // Build conversation history (last 5 messages, excluding current question)
      const history = this.messages.slice(-6, -1).map(msg => ({
         role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
         content: msg.content
      }));

      this.apiService.queryRag(question, 3, this.selectedProvider, history).subscribe({
         next: (response) => {
            // Add assistant response
            this.messages.push({
               type: 'assistant',
               content: response.answer,
               sources: response.sources,
               tokensUsed: response.tokensUsed
            });
            this.isQuerying = false;
         },
         error: (error) => {
            this.errorMessage = error.message || 'Failed to get response';
            console.error('RAG query error:', error);
            this.isQuerying = false;
         }
      });
   }

   onEnter(event: KeyboardEvent) {
      if (!event.shiftKey) {
         event.preventDefault();
         this.sendQuery();
      }
   }

   clearChat() {
      if (confirm('Clear conversation history?')) {
         this.messages = [];
         this.errorMessage = '';
      }
   }

   truncate(text: string, maxLength: number): string {
      if (text.length <= maxLength) {
         return text;
      }
      return text.substring(0, maxLength) + '...';
   }
}
