import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ChromaModule } from '../chroma/chroma.module';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
   imports: [ChromaModule, EmbeddingModule],
   controllers: [DocumentsController],
   providers: [DocumentsService],
   exports: [DocumentsService],
})
export class DocumentsModule { }
