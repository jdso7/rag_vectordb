import {
   Controller,
   Get,
   Post,
   Put,
   Delete,
   Body,
   Param,
   Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';

class AddDocumentDto {
   content: string;
   title?: string;
}

class SearchQueryDto {
   query: string;
   limit?: number;
}

class UpdateDocumentDto {
   content?: string;
   title?: string;
}

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
   constructor(private readonly documentsService: DocumentsService) { }

   @Post()
   @ApiOperation({ summary: 'Add a new document' })
   @ApiResponse({ status: 201, description: 'Document added successfully' })
   async addDocument(@Body() addDocumentDto: AddDocumentDto) {
      return await this.documentsService.addDocument(
         addDocumentDto.content,
         addDocumentDto.title,
      );
   }

   @Get()
   @ApiOperation({ summary: 'Get all documents' })
   @ApiResponse({ status: 200, description: 'Returns all documents' })
   async getAllDocuments() {
      return await this.documentsService.getAllDocuments();
   }

   @Get('count')
   @ApiOperation({ summary: 'Get document count' })
   @ApiResponse({ status: 200, description: 'Returns document count' })
   async getDocumentCount() {
      const count = await this.documentsService.getDocumentCount();
      return { count };
   }

   @Post('search')
   @ApiOperation({ summary: 'Search documents by semantic similarity' })
   @ApiResponse({ status: 200, description: 'Returns relevant documents' })
   async searchDocuments(@Body() searchQuery: SearchQueryDto) {
      return await this.documentsService.searchDocuments(
         searchQuery.query,
         searchQuery.limit || 5,
      );
   }

   @Put(':id')
   @ApiOperation({ summary: 'Update a document by ID' })
   @ApiResponse({ status: 200, description: 'Document updated successfully' })
   async updateDocument(
      @Param('id') id: string,
      @Body() updateDocumentDto: UpdateDocumentDto,
   ) {
      return await this.documentsService.updateDocument(
         id,
         updateDocumentDto.content,
         updateDocumentDto.title,
      );
   }

   @Delete(':id')
   @ApiOperation({ summary: 'Delete a document by ID' })
   @ApiResponse({ status: 200, description: 'Document deleted successfully' })
   async deleteDocument(@Param('id') id: string) {
      return await this.documentsService.deleteDocument(id);
   }
}
