# LLM Providers Guide for ACE MCP Server

This guide helps you choose and configure the optimal LLM provider for your ACE (Agentic Context Engineering) implementation.

## 🎯 Quick Recommendation

**For Production ACE Framework: Use DeepSeek V3.2-Exp**

DeepSeek-V3.2-Exp has shown the best results for ACE framework tasks, offering:
- Excellent reasoning capabilities for reflection and curation
- 128K context window (ideal for long playbooks)
- Cost-effective pricing ($0.28/1M input, $0.42/1M output tokens)
- Both standard and "thinking mode" (reasoner) variants

## 📊 Provider Comparison Matrix

| Provider | Best For | Context | Cost/Quality | API Access | Embeddings |
|----------|----------|---------|--------------|------------|------------|
| **DeepSeek V3.2** | **ACE Production** | 128K | ⭐⭐⭐⭐⭐ | Easy | ✅ |
| OpenAI GPT-4o | Universal | 128K | ⭐⭐⭐⭐ | Easy | ✅ |
| Claude 3 Opus | Long Context | 200K | ⭐⭐⭐ | Medium | ❌ |
| Gemini 1.5 Pro | Huge Context | 1M | ⭐⭐⭐⭐ | Medium | ✅ |
| Mistral Large | Open Source | 32K-65K | ⭐⭐⭐ | Easy | ✅ |
| LM Studio | Local/Private | Varies | ⭐⭐ | Local | Varies |

## 🚀 Provider Details

### 1. DeepSeek V3.2-Exp (RECOMMENDED)

**Why Best for ACE:**
- Optimized for reasoning and chain-of-thought analysis
- Excellent performance in Generator, Reflector, and Curator phases
- Two modes: `deepseek-chat` (standard) and `deepseek-reasoner` (thinking mode)

**Configuration:**
```env
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
DEEPSEEK_MODEL=deepseek-chat
# For complex reasoning tasks, use: deepseek-reasoner
```

**Pricing:**
- Input: $0.28 per 1M tokens (cache miss), $0.028 (cache hit)
- Output: $0.42 per 1M tokens
- Context: 128K tokens
- Max Output: 4K (chat), 32K (reasoner)

**Get API Key:** [https://platform.deepseek.com/](https://platform.deepseek.com/)

### 2. OpenAI GPT-4o

**Strengths:**
- Excellent balance of cost, speed, and quality
- Best ecosystem support and documentation
- Reliable for all ACE framework phases

**Configuration:**
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

**Use Cases:**
- When you need proven reliability
- Existing OpenAI infrastructure
- Need both chat and embeddings from same provider

**Get API Key:** [https://platform.openai.com/](https://platform.openai.com/)

### 3. Anthropic Claude 3

**Strengths:**
- Largest context window (200K tokens)
- Excellent for complex reasoning tasks
- Strong safety and alignment

**Configuration:**
```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
ANTHROPIC_MODEL=claude-3-sonnet-20240229
# Options: claude-3-opus-20240229 (best), claude-3-haiku-20240307 (fast)
```

**Limitations:**
- No embeddings API (use OpenAI for embeddings)
- More expensive than alternatives
- Requires separate embedding provider

**Get API Key:** [https://console.anthropic.com/](https://console.anthropic.com/)

### 4. Google Gemini 1.5 Pro

**Strengths:**
- Massive 1M token context window
- Good reasoning capabilities
- Competitive pricing

**Configuration:**
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-google-api-key-here
GEMINI_MODEL=gemini-1.5-pro
# Alternative: gemini-1.5-flash (faster, cheaper)
```

**Use Cases:**
- Extremely large playbooks (>100K tokens)
- Document-heavy ACE implementations
- Cost-sensitive deployments

**Get API Key:** [https://ai.google.dev/](https://ai.google.dev/)

### 5. Mistral Large

**Strengths:**
- Open-source friendly
- Good performance for the price
- Can be self-hosted

**Configuration:**
```env
LLM_PROVIDER=mistral
MISTRAL_API_KEY=your-mistral-api-key-here
MISTRAL_MODEL=mistral-large-latest
# Alternatives: mixtral-8x7b-instruct, mixtral-8x22b-instruct
```

**Use Cases:**
- Open-source requirements
- European data residency
- Self-hosted deployments

**Get API Key:** [https://mistral.ai/](https://mistral.ai/)

### 6. LM Studio (Local)

**Strengths:**
- Complete privacy and control
- No API costs after setup
- Works offline

**Configuration:**
```env
LLM_PROVIDER=lmstudio
LMSTUDIO_BASE_URL=http://localhost:1234/v1
LMSTUDIO_MODEL=your-local-model
```

**Use Cases:**
- Sensitive data requirements
- No internet connectivity
- Development and testing

**Setup:** [https://lmstudio.ai/](https://lmstudio.ai/)

## 🎯 ACE Framework Optimization

### For Different ACE Phases:

**Generator Phase:**
- **Best:** DeepSeek-chat, GPT-4o
- **Alternative:** Claude-3-sonnet, Gemini-1.5-pro

**Reflector Phase (Critical):**
- **Best:** DeepSeek-reasoner (thinking mode)
- **Alternative:** Claude-3-opus, GPT-4o

**Curator Phase:**
- **Best:** DeepSeek-chat, Claude-3-sonnet
- **Alternative:** GPT-4o, Mistral-large

### Context Size Recommendations:

| Playbook Size | Recommended Provider | Reason |
|---------------|---------------------|---------|
| < 50K tokens | Any provider | All handle this well |
| 50K-100K tokens | DeepSeek, GPT-4o, Claude-3 | Good context handling |
| 100K-200K tokens | Claude-3, Gemini-1.5 | Large context specialists |
| > 200K tokens | Gemini-1.5 Pro | Only option with 1M context |

## 🔧 Configuration Examples

### Multi-Provider Setup (Recommended)

Use different providers for different phases:

```env
# Primary provider for most tasks
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxx

# Fallback for embeddings (if primary doesn't support)
OPENAI_API_KEY=sk-xxx
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### Docker Compose Override

```yaml
# docker-compose.override.yml
services:
  ace-server:
    environment:
      - LLM_PROVIDER=deepseek
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - DEEPSEEK_MODEL=deepseek-reasoner  # Use thinking mode
```

### Cursor AI Configuration

```json
{
  "mcpServers": {
    "ace-context-engine": {
      "command": "node",
      "args": ["/path/to/ace-mcp-server/dist/index.js"],
      "env": {
        "LLM_PROVIDER": "deepseek",
        "DEEPSEEK_API_KEY": "sk-your-key-here",
        "DEEPSEEK_MODEL": "deepseek-chat",
        "ACE_CONTEXT_DIR": "./contexts",
        "ACE_LOG_LEVEL": "info"
      }
    }
  }
}
```

## 💡 Best Practices

### 1. Provider Selection Strategy

```
Production: DeepSeek V3.2-Exp (best results)
Fallback: OpenAI GPT-4o (reliability)
Embeddings: OpenAI text-embedding-3-small (if needed)
Development: LM Studio (cost-effective testing)
```

### 2. Cost Optimization

- Use DeepSeek for most tasks (lowest cost/token)
- Cache frequently used contexts
- Use smaller models for simple curation tasks
- Monitor token usage with structured logging

### 3. Performance Tuning

```env
# For faster responses
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TIMEOUT=30000

# For better reasoning (slower)
DEEPSEEK_MODEL=deepseek-reasoner
DEEPSEEK_TIMEOUT=120000
```

### 4. Error Handling

All providers include automatic retry logic and graceful degradation:

```typescript
// Automatic in ACE MCP Server
const provider = createLLMProvider({
  provider: 'deepseek',
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY!,
    maxRetries: 3,
    timeout: 60000
  }
});
```

## 🔍 Troubleshooting

### Common Issues:

**API Key Invalid:**
```bash
# Check your API key format
echo $DEEPSEEK_API_KEY | head -c 10
# Should start with 'sk-'
```

**Timeout Errors:**
```env
# Increase timeout for complex reasoning
DEEPSEEK_TIMEOUT=120000
```

**Rate Limits:**
```env
# Add delays between requests
DEEPSEEK_MAX_RETRIES=5
```

**Context Too Large:**
```env
# Switch to larger context provider
LLM_PROVIDER=gemini
GEMINI_MODEL=gemini-1.5-pro
```

## 📈 Monitoring and Metrics

Enable detailed logging to monitor provider performance:

```env
ACE_LOG_LEVEL=debug
```

Key metrics to track:
- Token usage per provider
- Response times
- Error rates
- Cost per ACE cycle

## 🔄 Migration Between Providers

To switch providers without losing context:

1. Update `.env` file
2. Restart ACE MCP Server
3. Existing playbooks remain compatible
4. New generations use the new provider

```bash
# Example migration
docker-compose down
# Update LLM_PROVIDER in .env
docker-compose up -d
```

---

**Need Help?** Check the [main documentation](../README.md) or open an issue on GitHub.
