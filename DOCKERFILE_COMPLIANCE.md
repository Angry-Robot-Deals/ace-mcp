# Dockerfile Compliance with Docker MCP Registry and Cursor AI Catalog Requirements

## ✅ Compliance Check

### Current Configuration

**Dockerfile Structure:**
- ✅ Multi-stage build (builder + production)
- ✅ Non-root user (app)
- ✅ Minimal base image (node:lts-slim)
- ✅ Proper layer caching
- ✅ CMD for MCP server
- ✅ HEALTHCHECK for HTTP endpoints
- ✅ Port exposure (34301) for health checks

**Command Configuration:**
```dockerfile
CMD ["node", "dist/index.js"]
```

**Transport Type:**
- ✅ **STDIO Transport**: Primary MCP communication via `StdioServerTransport`
- ✅ **HTTP Server**: Secondary HTTP server for health checks and API endpoints (port 34301)
- ✅ **Hybrid Approach**: Supports both stdio (for MCP clients) and HTTP (for health monitoring)

### ✅ Compliance with Docker MCP Registry Standards

1. **✅ Dockerfile in root directory** - Required
2. **✅ Valid Dockerfile** - Builds successfully
3. **✅ CMD for stdio transport** - Standard for MCP servers (primary transport)
4. **✅ Non-root user** - Security best practice
5. **✅ Minimal image size** - Uses node:lts-slim
6. **✅ HEALTHCHECK** - Configured for HTTP health endpoint (appropriate for hybrid servers)
7. **✅ Port exposure** - Port 34301 exposed for health checks
8. **✅ Multi-stage build** - Optimized for production

### Comparison with Registry Examples

**From Docker MCP Registry examples:**
- Most stdio MCP servers use: `CMD ["node", "path/to/server.js"]` or `CMD ["python", "main.py"]`
- ENTRYPOINT is rarely used for simple stdio servers
- HEALTHCHECK is used for servers with HTTP endpoints
- Hybrid servers (stdio + HTTP) are supported and documented

**Our implementation:**
- ✅ Uses `CMD ["node", "dist/index.js"]` - matches standard pattern
- ✅ Primary transport: STDIO (for MCP protocol)
- ✅ Secondary HTTP server: For health checks and API endpoints
- ✅ HEALTHCHECK configured: Uses HTTP endpoint `/health`
- ✅ No ENTRYPOINT needed - simpler and more flexible

### Why CMD Instead of ENTRYPOINT?

1. **Flexibility**: Users can override command if needed
2. **Standard Practice**: Matches examples in Docker MCP Registry
3. **Simplicity**: No need for wrapper script for stdio servers
4. **Docker Best Practices**: CMD is preferred for default command

### Transport Architecture

**ACE MCP Server uses a hybrid approach:**

1. **Primary: STDIO Transport** (for MCP protocol)
   - Used by MCP clients (Cursor AI, Claude Desktop, etc.)
   - Standard input/output communication
   - Configured via `.cursor/mcp.json`:
     ```json
     {
       "mcpServers": {
         "ace-mcp-server": {
           "command": "node",
           "args": ["/path/to/ace-mcp-server/dist/index.js"],
           "env": {
             "LLM_PROVIDER": "deepseek",
             "API_BEARER_TOKEN": "your-token"
           }
         }
       }
     }
     ```

2. **Secondary: HTTP Server** (for health checks and API)
   - Health check endpoint: `http://localhost:34301/health`
   - API endpoints: `/api/*` (require Bearer token authentication)
   - Used by Docker HEALTHCHECK and external monitoring

**This hybrid approach is:**
- ✅ Supported by Docker MCP Registry
- ✅ Standard for servers that need health monitoring
- ✅ Compatible with stdio MCP clients
- ✅ Allows external API access when needed

### Health Check Configuration

**HEALTHCHECK in Dockerfile:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:34301/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"
```

**Health Endpoint:**
- URL: `http://localhost:34301/health`
- Method: GET
- Response: JSON with status, version, uptime
- Authentication: Not required (public endpoint)

### Logging

Logs are visible in `docker logs` because:
- Application logs use standard Node.js logging
- HTTP server logs are written to stdout/stderr
- All logs are captured by Docker and visible in `docker logs`

### Testing

```bash
# Build image
docker build -t ace-mcp-server:latest .

# Run with stdio (for MCP clients)
docker run -i --rm \
  -e LLM_PROVIDER=deepseek \
  -e DEEPSEEK_API_KEY=your-key \
  -e API_BEARER_TOKEN=your-token \
  ace-mcp-server:latest

# Run with HTTP health check (detached)
docker run -d --name ace-mcp-server \
  -p 34301:34301 \
  -e LLM_PROVIDER=deepseek \
  -e DEEPSEEK_API_KEY=your-key \
  -e API_BEARER_TOKEN=your-token \
  ace-mcp-server:latest

# Check health
curl http://localhost:34301/health

# View logs
docker logs ace-mcp-server
```

### ✅ Compliance with Cursor AI Catalog Requirements

1. **✅ GitHub Repository** - https://github.com/Angry-Robot-Deals/ace-mcp
2. **✅ License: MIT** - Specified in package.json
3. **✅ README.md** - Comprehensive documentation with:
   - Installation instructions
   - Configuration examples
   - Usage examples
   - API documentation
4. **✅ Dockerfile** - Present in root directory
5. **✅ Environment Variables** - Documented in .env.example and README.md
6. **✅ MCP Tools Documentation** - All 4 tools documented:
   - `ace_smart_generate` - Smart code generation with auto-enhancement
   - `ace_smart_reflect` - Code analysis and reflection with suggestions
   - `ace_context_aware` - Context-aware assistance based on domain
   - `ace_enhance_prompt` - Automatic prompt enhancement with playbook knowledge
7. **✅ Configuration Examples** - Provided for multiple LLM providers
8. **✅ Test Suite** - Automated tests via `test-server.mjs`

### Required Environment Variables

**For Docker MCP Registry:**
- `LLM_PROVIDER` (required): deepseek, openai, anthropic, gemini, mistral, lmstudio
- `API_BEARER_TOKEN` (required): Bearer token for authentication
- Provider-specific API keys (required, based on LLM_PROVIDER):
  - `DEEPSEEK_API_KEY` (if LLM_PROVIDER=deepseek)
  - `OPENAI_API_KEY` (if LLM_PROVIDER=openai)
  - `ANTHROPIC_API_KEY` (if LLM_PROVIDER=anthropic)
  - `GOOGLE_API_KEY` (if LLM_PROVIDER=gemini)
  - `MISTRAL_API_KEY` (if LLM_PROVIDER=mistral)
  - `LMSTUDIO_BASE_URL` (if LLM_PROVIDER=lmstudio)

**Optional Environment Variables:**
- `ACE_SERVER_PORT` (default: 34301)
- `ACE_CONTEXT_DIR` (default: ./contexts)
- `ACE_LOG_LEVEL` (default: info)
- `ACE_MAX_PLAYBOOK_SIZE` (default: 1000)
- `NODE_ENV` (default: production)

### Docker Registry Configuration Requirements

**For server.yaml:**
- Category: `ai`, `development`, `tools`, `code-generation`
- Type: `server` (Docker-built image)
- Secrets: API keys for LLM providers, API_BEARER_TOKEN
- Environment variables: LLM_PROVIDER, ACE_* configuration variables
- Volumes: Optional (for contexts and logs persistence)

**Example server.yaml structure:**
```yaml
name: ace-mcp-server
image: mcp/ace-mcp-server
type: server
meta:
  category: ai
  tags:
    - ai
    - development
    - code-generation
    - context-engineering
about:
  title: ACE MCP Server
  description: Agentic Context Engineering MCP Server for intelligent code generation
  icon: https://avatars.githubusercontent.com/u/182288589?s=200&v=4
source:
  project: https://github.com/Angry-Robot-Deals/ace-mcp
config:
  description: Configure ACE MCP Server with LLM provider
  secrets:
    - name: ace-mcp-server.api_bearer_token
      env: API_BEARER_TOKEN
      example: your-secure-bearer-token
    - name: ace-mcp-server.llm_api_key
      env: DEEPSEEK_API_KEY  # or OPENAI_API_KEY, etc.
      example: your-llm-api-key
  env:
    - name: LLM_PROVIDER
      example: deepseek
      value: '{{ace-mcp-server.llm_provider}}'
    - name: ACE_LOG_LEVEL
      example: info
      value: '{{ace-mcp-server.log_level}}'
```

### Cursor AI Catalog Configuration

**For .cursor/mcp.json:**
```json
{
  "mcpServers": {
    "ace-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/ace-mcp-server/dist/index.js"],
      "env": {
        "LLM_PROVIDER": "deepseek",
        "DEEPSEEK_API_KEY": "your-api-key",
        "API_BEARER_TOKEN": "your-bearer-token",
        "ACE_LOG_LEVEL": "info"
      }
    }
  }
}
```

**Or using Docker:**
```json
{
  "mcpServers": {
    "ace-mcp-server": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "LLM_PROVIDER",
        "-e", "DEEPSEEK_API_KEY",
        "-e", "API_BEARER_TOKEN",
        "ace-mcp-server:latest"
      ],
      "env": {
        "LLM_PROVIDER": "deepseek",
        "DEEPSEEK_API_KEY": "your-api-key",
        "API_BEARER_TOKEN": "your-bearer-token"
      }
    }
  }
}
```

### Differences from sys8 (stdio-only server)

| Aspect | sys8 | ace-mcp-server |
|--------|------|----------------|
| **Primary Transport** | STDIO only | STDIO (primary) + HTTP (secondary) |
| **HEALTHCHECK** | Not needed | ✅ Configured (HTTP endpoint) |
| **Port Exposure** | Not needed | ✅ Port 34301 exposed |
| **Use Case** | Simple stdio server | Hybrid server with API endpoints |
| **Docker Registry** | ✅ Compliant | ✅ Compliant (hybrid supported) |
| **Cursor AI Catalog** | ✅ Compliant | ✅ Compliant |

### Potential Issues and Solutions

#### Issue 1: HTTP Server Not Required for MCP
**Status**: ✅ Not an issue
**Explanation**: HTTP server is optional and used only for health checks. MCP communication uses stdio transport, which is the primary and required transport.

#### Issue 2: Port Exposure
**Status**: ✅ Compliant
**Explanation**: Port exposure is optional for stdio servers but recommended for servers with health checks. Docker MCP Registry supports this pattern.

#### Issue 3: HEALTHCHECK Configuration
**Status**: ✅ Compliant
**Explanation**: HEALTHCHECK is appropriate for servers with HTTP endpoints. It's optional but recommended for production deployments.

### Conclusion

✅ **Current Dockerfile configuration fully complies with Docker MCP Registry requirements and best practices.**

✅ **Current project configuration fully complies with Cursor AI Catalog requirements.**

**Key Compliance Points:**
- ✅ Dockerfile in root directory
- ✅ Valid Dockerfile (builds successfully)
- ✅ CMD for stdio transport (primary MCP communication)
- ✅ HEALTHCHECK for HTTP endpoints (optional but recommended)
- ✅ Non-root user (security best practice)
- ✅ Multi-stage build (optimized image size)
- ✅ MIT License
- ✅ GitHub repository specified
- ✅ Comprehensive README.md
- ✅ Environment variables documented
- ✅ Configuration examples provided
- ✅ Test suite available

**The hybrid approach (stdio + HTTP) is:**
- ✅ Supported by Docker MCP Registry
- ✅ Standard for servers needing health monitoring
- ✅ Compatible with all MCP clients
- ✅ Allows flexible deployment options

**Ready for publication in:**
- ✅ Docker MCP Registry (via pull request)
- ✅ Cursor AI Catalog (via issue request)
