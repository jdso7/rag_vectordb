import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentsModule } from './documents/documents.module';
import { RagModule } from './rag/rag.module';

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
      }),
      DocumentsModule,
      RagModule,
   ],
})
export class AppModule { }
