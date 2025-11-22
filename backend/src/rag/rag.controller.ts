import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RagService } from './rag.service';

class ChatMessage {
   role: 'user' | 'assistant';
   content: string;
}

class RagQueryDto {
   question: string;
   contextLimit?: number;
   provider?: string;
   conversationHistory?: ChatMessage[];
}

@ApiTags('rag')
@Controller('rag')
export class RagController {
   constructor(private readonly ragService: RagService) { }

   @Post('query')
   @ApiOperation({ summary: 'Query LLM (ChatGPT or Llama) with RAG context' })
   @ApiResponse({ status: 200, description: 'Returns answer with sources' })
   async query(@Body() ragQuery: RagQueryDto) {
      return await this.ragService.query(
         ragQuery.question,
         ragQuery.contextLimit || 3,
         ragQuery.provider || 'openai',
         ragQuery.conversationHistory || [],
      );
   }
}
