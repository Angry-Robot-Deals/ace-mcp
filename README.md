# ACE MCP Server

> **Agentic Context Engineering (ACE)** - Self-improving AI context framework with Model Context Protocol (MCP) integration for Cursor AI.

## 🎯 Overview

ACE MCP Server is an intelligent development assistant that learns from your coding patterns and automatically enhances your development workflow. It integrates seamlessly with Cursor AI through the Model Context Protocol (MCP), providing contextual code generation, intelligent analysis, and self-improving recommendations.

### ✨ Key Features

- **🤖 Smart Code Generation** - Context-aware code generation with automatic prompt enhancement
- **🧠 Intelligent Code Analysis** - Deep code analysis with actionable improvement suggestions  
- **📚 Self-Improving Playbook** - Accumulates knowledge and patterns from your development work
- **🔧 Multiple LLM Support** - Works with OpenAI, Anthropic Claude, DeepSeek, Google, Mistral, and LM Studio
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
- **[Docker Guide](./docs/deployment/DEPLOYMENT.md)** - Complete Docker deployment guide

### 📖 Project Documentation
- **[Project Status](./docs/intro/PROJECT_STATUS.md)** - Current development status
- **[Architecture](./docs/intro/INITIALIZATION_REPORT.md)** - Technical architecture details
- **[GitHub Setup](./docs/intro/GITHUB_INITIALIZATION.md)** - Repository initialization

### 🧠 Memory Bank
- **[Memory Bank Overview](./memory-bank/README.md)** - Central knowledge repository
- **[Development Patterns](./memory-bank/systemPatterns.md)** - Coding patterns and rules
- **[Project Context](./memory-bank/projectbrief.md)** - Project goals and vision

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
Add to your Cursor AI settings:
```json
{
  "mcp.servers": {
    "ace-context-engineering": {
      "command": "npx",
      "args": ["tsx", "/path/to/ace-mcp-server/src/mcp-server-enhanced.ts"],
      "env": {
        "ACE_AUTO_ENHANCE": "true"
      }
    }
  }
}
```

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
```

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

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# LLM Provider Configuration
LLM_PROVIDER=openai                    # openai, lmstudio, deepseek, anthropic
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4

# LM Studio Configuration (for local models)
LMSTUDIO_BASE_URL=http://localhost:1234/v1
LMSTUDIO_MODEL=local-model

# Server Configuration
ACE_SERVER_PORT=34301
DASHBOARD_PORT=34300
API_BEARER_TOKEN=your-secure-token

# Docker Configuration
COMPOSE_PROJECT_NAME=ace-mcp
DOCKER_BUILDKIT=1
```

### Port Configuration
ACE uses ports in the range **34300-34400**:
- **34300**: Dashboard (HTTP)
- **34301**: ACE MCP Server (API)
- **34302-34400**: Reserved for future services

## 🤝 Contributing

1. **Read the Documentation** - Start with [Project Overview](./docs/intro/START_HERE.md)
2. **Check Memory Bank** - Review [Development Patterns](./memory-bank/systemPatterns.md)
3. **Follow Standards** - Use [Style Guide](./memory-bank/style-guide.md)
4. **Submit PRs** - Follow our contribution guidelines

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **[GitHub Repository](https://github.com/Angry-Robot-Deals/ace-mcp)**
- **[Issues & Bug Reports](https://github.com/Angry-Robot-Deals/ace-mcp/issues)**
- **[Documentation](./docs/)**
- **[Memory Bank](./memory-bank/)**

---

**ACE MCP Server - Making AI development smarter, one interaction at a time.** 🚀
