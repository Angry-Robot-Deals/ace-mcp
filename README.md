# ACE MCP Server

> **Agentic Context Engineering (ACE)** - Self-improving AI context framework with Model Context Protocol (MCP) integration for Cursor AI.

## 🎯 Overview

ACE MCP Server is an intelligent development assistant that learns from your coding patterns and automatically enhances your development workflow. It integrates seamlessly with Cursor AI through the Model Context Protocol (MCP), providing contextual code generation, intelligent analysis, and self-improving recommendations.

### ✨ Key Features

- **🤖 Smart Code Generation** - Context-aware code generation with automatic prompt enhancement
- **🧠 Intelligent Code Analysis** - Deep code analysis with actionable improvement suggestions  
- **📚 Self-Improving Playbook** - Accumulates knowledge and patterns from your development work
- **🔧 Multiple LLM Support** - Works with OpenAI, Anthropic Claude, DeepSeek, Google Gemini, Mistral, and LM Studio
- **🐳 Docker Ready** - Complete containerized solution for local and production deployment
- **🔒 Secure by Default** - Bearer token authentication and comprehensive security measures

### 🚀 What Makes ACE Special

ACE doesn't just generate code - it **learns** from your development patterns and **improves** over time:

1. **Generates** contextual development trajectories
2. **Reflects** on code to extract insights and patterns  
3. **Curates** knowledge into a self-improving playbook
4. **Enhances** future interactions with accumulated wisdom

## 📚 Documentation

### 🚀 Getting Started
- **[Installation Guide](./docs/intro/INSTALLATION.md)** - Complete setup instructions
- **[Project Overview](./docs/intro/START_HERE.md)** - Detailed project introduction
- **[Quick Start](./docs/intro/DESCRIPTION.md)** - Fast track to running ACE

### ⚙️ Setup & Configuration  
- **[Cursor AI Setup](./docs/setup/CURSOR_AI_SETUP.md)** - Basic MCP integration
- **[Enhanced Auto Setup](./docs/setup/CURSOR_AI_AUTO_SETUP.md)** - Smart auto-enhancement features
- **[LLM Providers](./docs/LLM_PROVIDERS.md)** - Configure different AI providers

### 🚀 Deployment
- **[Production Deployment](./docs/deployment/DEPLOYMENT_README.md)** - Deploy to production servers
- **[Full Deployment Guide](./docs/intro/DEPLOYMENT.md)** - Complete Docker deployment guide

### 📖 Project Documentation
- **[Project Status](./docs/intro/PROJECT_STATUS.md)** - Current development status
- **[Architecture](./docs/intro/INITIALIZATION_REPORT.md)** - Technical architecture details
- **[GitHub Setup](./docs/intro/GITHUB_INITIALIZATION.md)** - Repository initialization

## ⚡ Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/Angry-Robot-Deals/ace-mcp.git
cd ace-mcp
cp .env.example .env
# Edit .env with your configuration
```

### 2. Docker Development
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop environment  
docker-compose -f docker-compose.dev.yml down
```

### 3. Configure Cursor AI

See detailed setup instructions:

- **[Basic Cursor AI Setup](./docs/setup/CURSOR_AI_SETUP.md)** - Initialize your MCP server with basic ACE tools
- **[Enhanced Auto Setup](./docs/setup/CURSOR_AI_AUTO_SETUP.md)** - Automatically enhance prompts and invoke appropriate ACE methods

### 4. Use ACE Commands
```bash
# Smart code generation
@ace_smart_generate create a REST API endpoint

# Intelligent code analysis  
@ace_smart_reflect [your code here]

# Context-aware assistance
@ace_context_aware optimize database queries domain:database

# Automatic prompt enhancement
@ace_enhance_prompt create secure authentication focus_area:security

# View current playbook
@ace_playbook
```

### 5. View Playbook

The ACE playbook stores accumulated knowledge and patterns from your development work. View it using:

**Option 1: Via API endpoint (JSON)**
```bash
curl -H 'Authorization: Bearer YOUR_TOKEN' \
  http://localhost:34301/api/playbook | python3 -m json.tool
```

**Option 2: Using provided script**
```bash
./view-playbook.sh
```

**Option 3: Via MCP tool in Cursor AI**
```
@ace_playbook
```

**Option 4: Via dashboard**
```
http://localhost:34300
```

The playbook contains:
- **Patterns** - Code patterns and conventions learned from your work
- **Best Practices** - Development best practices accumulated over time
- **Insights** - Key insights extracted from code reflections

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- TypeScript

### Local Development
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build project
npm run build

# Start development server
npm run dev
```

### Docker Management
```bash
# Development environment
docker-compose -f docker-compose.dev.yml up -d

# Production environment  
docker-compose up -d

# View service logs
docker-compose logs ace-server
docker-compose logs ace-dashboard

# Rebuild services
docker-compose build --no-cache
```

## 🔧 Configuration

### LLM Providers & Models

ACE supports 6 LLM providers with various models:

#### Supported Providers

1. **DeepSeek** (Recommended) ⭐
   - Provider: `deepseek`
   - Default Model: `deepseek-chat` (V3.2-Exp)
   - Embedding Model: `deepseek-embedding`
   - Best for: ACE framework performance, cost-effective
   - Pricing: $0.28/1M input, $0.42/1M output tokens
   - Context: 128K tokens, Max output: 32K (reasoner mode)
   - Environment Variables:
     ```bash
     LLM_PROVIDER=deepseek
     DEEPSEEK_API_KEY=sk-your-deepseek-api-key
     DEEPSEEK_MODEL=deepseek-chat
     DEEPSEEK_EMBEDDING_MODEL=deepseek-embedding
     ```

2. **OpenAI**
   - Provider: `openai`
   - Models: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo`
   - Embedding Models: `text-embedding-3-small`, `text-embedding-3-large`
   - Environment Variables:
     ```bash
     LLM_PROVIDER=openai
     OPENAI_API_KEY=sk-your-openai-api-key
     OPENAI_MODEL=gpt-4o
     OPENAI_EMBEDDING_MODEL=text-embedding-3-small
     ```

3. **Anthropic Claude**
   - Provider: `anthropic`
   - Models: `claude-3-5-sonnet-20241022`, `claude-3-opus`, `claude-3-sonnet`, `claude-3-haiku`
   - Environment Variables:
     ```bash
     LLM_PROVIDER=anthropic
     ANTHROPIC_API_KEY=sk-ant-your-api-key
     ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
     ```

4. **Google Gemini**
   - Provider: `gemini`
   - Models: `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-pro`
   - Environment Variables:
     ```bash
     LLM_PROVIDER=gemini
     GOOGLE_API_KEY=your-google-api-key
     GOOGLE_MODEL=gemini-1.5-pro
     ```

5. **Mistral**
   - Provider: `mistral`
   - Models: `mistral-large-latest`, `mistral-medium-latest`, `mistral-small-latest`
   - Environment Variables:
     ```bash
     LLM_PROVIDER=mistral
     MISTRAL_API_KEY=your-mistral-api-key
     MISTRAL_MODEL=mistral-large-latest
     ```

6. **LM Studio** (Local/Self-hosted)
   - Provider: `lmstudio`
   - Models: Any local model compatible with OpenAI API format
   - Environment Variables:
     ```bash
     LLM_PROVIDER=lmstudio
     LMSTUDIO_BASE_URL=http://localhost:1234/v1
     LMSTUDIO_MODEL=local-model
     ```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# LLM Provider Selection (required)
# Options: 'deepseek', 'openai', 'anthropic', 'gemini', 'mistral', 'lmstudio'
LLM_PROVIDER=deepseek

# Provider-specific API keys and models (see above for details)
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
DEEPSEEK_MODEL=deepseek-chat

# Server Configuration
ACE_SERVER_PORT=34301
DASHBOARD_PORT=34300
API_BEARER_TOKEN=your-secure-token

# Docker Configuration
COMPOSE_PROJECT_NAME=ace-mcp
DOCKER_BUILDKIT=1
```

For complete configuration options, see `.env.example` file.


## 🤝 Contributing

1. **Read the Documentation** - Start with [Project Overview](./docs/intro/START_HERE.md)
2. **Follow Best Practices** - Review [Development Guide](./docs/intro/DESCRIPTION.md)
3. **Submit PRs** - [Follow our contribution guidelines](./docs/CONTRIBUTING.md)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **[GitHub Repository](https://github.com/Angry-Robot-Deals/ace-mcp)**
- **[Issues & Bug Reports](https://github.com/Angry-Robot-Deals/ace-mcp/issues)**
- **[Documentation](./docs/)**

---

**ACE MCP Server - Making AI development smarter, one interaction at a time.** 🚀
