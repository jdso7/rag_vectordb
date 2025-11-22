# 🧠 RAG Vector DB Lab

A complete lab environment for testing Retrieval-Augmented Generation (RAG) with Chroma vector database, local embeddings, and ChatGPT.

## 🏗️ Architecture

- **Frontend**: Angular 17 (standalone components)
- **Backend**: NestJS with REST API
- **Vector Database**: Chroma
- **Embeddings**: Local sentence-transformers (all-MiniLM-L6-v2)
- **LLM**: OpenAI ChatGPT (GPT-3.5-turbo)
- **Containerization**: Docker Compose

## 📋 Prerequisites

- Docker and Docker Compose installed
- OpenAI API key (for RAG queries)
- At least 4GB of available RAM

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd /Users/jorge/Code/lab/rag_vectordb
```

### 2. Configure Environment

Copy the example environment file and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Start the Application

Start all services with Docker Compose:

```bash
docker-compose up --build
```

This will start:
- **Chroma** on `http://localhost:8000`
- **Embedding Service** on `http://localhost:8001`
- **NestJS Backend** on `http://localhost:3000`
- **Angular Frontend** on `http://localhost:4200`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:4200
```

## 🎯 Features

### Document Manager
- ✅ Add plain text documents with optional titles
- ✅ View all stored documents
- ✅ Delete documents
- ✅ Automatic embedding generation using local models
- ✅ Document count tracking

### RAG Chat
- ✅ Ask questions about your documents
- ✅ ChatGPT answers based on retrieved context
- ✅ View source documents used for each answer
- ✅ See relevance scores (distance metrics)
- ✅ Token usage tracking
- ✅ Conversational UI

### Semantic Search
- ✅ Find relevant documents using similarity search
- ✅ Configurable result limits
- ✅ Distance-based ranking

## 📡 API Endpoints

### Documents
- `POST /documents` - Add a new document
- `GET /documents` - Get all documents
- `GET /documents/count` - Get document count
- `POST /documents/search` - Search documents by semantic similarity
- `DELETE /documents/:id` - Delete a document

### RAG
- `POST /rag/query` - Query ChatGPT with RAG context

### API Documentation
Swagger documentation available at: `http://localhost:3000/api`

## 🔧 Development

### Backend Development

```bash
cd backend
npm install
npm run start:dev
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

## 📊 How It Works

1. **Adding Documents**:
   - User submits text content
   - Backend generates embeddings using local sentence-transformers
   - Document + embedding stored in Chroma vector database

2. **RAG Query Flow**:
   - User asks a question
   - Question is converted to embedding
   - Similar documents retrieved from Chroma (semantic search)
   - Retrieved documents used as context for ChatGPT
   - ChatGPT generates answer based on context
   - Answer + sources returned to user

3. **Embeddings**:
   - Model: `sentence-transformers/all-MiniLM-L6-v2`
   - Dimension: 384
   - Runs locally in Docker (no API keys needed)
   - Fast inference (~50ms per document)

## 🧪 Testing the Lab

### Basic Workflow

1. **Add Sample Documents**:
   ```
   Title: Python Basics
   Content: Python is a high-level programming language known for its simplicity and readability. It supports multiple programming paradigms including procedural, object-oriented, and functional programming.
   ```

   ```
   Title: Machine Learning
   Content: Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn.
   ```

2. **Test Semantic Search**:
   - Go to Document Manager
   - Add documents
   - Use the search feature to find relevant content

3. **Test RAG Chat**:
   - Ask: "What is Python?"
   - Ask: "Tell me about machine learning"
   - Ask: "How are Python and ML related?"
   - Observe how the system retrieves relevant documents and uses them to answer

## 🐛 Troubleshooting

### Containers Not Starting

Check container logs:
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs chroma
docker-compose logs embedding-service
```

### Backend Connection Issues

Verify services are healthy:
```bash
docker-compose ps
```

Check if ports are available:
```bash
lsof -i :3000  # Backend
lsof -i :4200  # Frontend
lsof -i :8000  # Chroma
lsof -i :8001  # Embeddings
```

### Embedding Service Not Responding

The embedding service downloads the model on first start (~100MB). This can take a few minutes. Check logs:
```bash
docker-compose logs -f embedding-service
```

### OpenAI API Errors

- Ensure your API key is correctly set in `.env`
- Check your OpenAI account has available credits
- Verify the key has GPT-3.5-turbo access

## 🛑 Stopping the Application

```bash
docker-compose down
```

To also remove volumes (deletes all documents):
```bash
docker-compose down -v
```

## 🔄 Rebuilding

After code changes:
```bash
docker-compose up --build
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for ChatGPT | Required |
| `CHROMA_URL` | Chroma database URL | `http://chroma:8000` |
| `EMBEDDING_SERVICE_URL` | Embedding service URL | `http://embedding-service:80` |
| `NODE_ENV` | Node environment | `development` |

## 📚 Technology Stack

### Backend
- NestJS 10.x
- TypeScript
- ChromaDB Client
- OpenAI Node SDK
- Axios

### Frontend
- Angular 17 (Standalone)
- TypeScript
- RxJS
- HttpClient

### Infrastructure
- Docker & Docker Compose
- Chroma Vector DB
- HuggingFace Text Embeddings Inference

## 🎓 Learning Resources

- [Chroma Documentation](https://docs.trychroma.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [RAG Explained](https://www.promptingguide.ai/techniques/rag)
- [Sentence Transformers](https://www.sbert.net/)

## 📄 License

MIT

## 🤝 Contributing

This is a lab project for learning and experimentation. Feel free to modify and extend it for your needs!
