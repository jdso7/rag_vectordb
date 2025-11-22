# Running Ollama on Your Laptop

The project is now configured to use Ollama running directly on your laptop instead of in a Docker container. This provides better performance and easier model management.

## Setup

### 1. Install Ollama (if not already installed)
```bash
# macOS
brew install ollama

# Or download from: https://ollama.ai
```

### 2. Start Ollama Service
```bash
ollama serve
```

Ollama will start on `http://localhost:11434`

### 3. Pull the Llama Model (if not already downloaded)
```bash
ollama pull llama3.2
```

### 4. Verify Installation
```bash
# Check available models
ollama list

# Test the model
ollama run llama3.2 "Hello, how are you?"
```

## Benefits

✅ **Faster Performance** - Native execution on your hardware
✅ **Better Resource Usage** - Direct access to CPU/GPU
✅ **Easier Model Management** - Use `ollama` CLI to add/remove models
✅ **Persistent Models** - Models stay available across container restarts

## Configuration

The backend connects to your local Ollama via:
- **URL**: `http://host.docker.internal:11434` (from Docker)
- **URL**: `http://localhost:11434` (from your laptop)

## Switching Models

To use a different model (e.g., smaller/faster):

```bash
# Pull a smaller model
ollama pull llama3.2:1b

# Update backend/src/rag/rag.service.ts:
# Change: model: 'llama3.2'
# To:     model: 'llama3.2:1b'
```

### Recommended Models by Speed:

- **llama3.2:1b** - Fastest, 1B parameters (~1.3GB)
- **llama3.2** - Balanced, 3B parameters (~2GB) ← Current
- **llama3.1:8b** - Best quality, 8B parameters (~4.7GB)

## Troubleshooting

### Connection Issues
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama service
killall ollama && ollama serve
```

### Model Not Found
```bash
# List available models
ollama list

# Pull the model
ollama pull llama3.2
```

## Performance Tips

Already applied in `backend/src/rag/rag.service.ts`:
- Lower temperature (0.5) for faster sampling
- Limited output tokens (500) for quicker responses
- Reduced context window (2048) for efficiency
