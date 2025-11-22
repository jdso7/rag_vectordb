import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

   // Enable CORS
   app.enableCors({
      origin: ['http://localhost:4200'],
      credentials: true,
   });

   // Swagger API documentation
   const config = new DocumentBuilder()
      .setTitle('RAG Vector DB API')
      .setDescription('API for RAG with Chroma vector database')
      .setVersion('1.0')
      .build();
   const document = SwaggerModule.createDocument(app, config);
   SwaggerModule.setup('api', app, document);

   await app.listen(3000);
   console.log(`Application is running on: http://localhost:3000`);
   console.log(`API Documentation: http://localhost:3000/api`);
}
bootstrap();
