import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { DocumentsModule } from '../documents/documents.module';

@Module({
   imports: [DocumentsModule],
   controllers: [RagController],
   providers: [RagService],
})
export class RagModule { }
