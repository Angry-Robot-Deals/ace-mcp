# 🎯 Setting Up ACE MCP in Cursor AI

## 📋 Step-by-Step Instructions

### 1. 🚀 Starting ACE MCP Server

First, make sure the ACE MCP server is running locally:

```bash
cd $HOME/code/perplexity/ace-mcp-server
docker-compose -f docker-compose.dev.yml up -d
```

Check status:
```bash
curl http://localhost:34301/health
```

### 2. 🔧 Cursor AI Configuration

#### Option A: Through Cursor Settings

1. Open **Cursor AI**
2. Go to **Settings** (⌘ + ,)
3. Find **MCP Servers** or **Extensions** section
4. Add a new MCP server with settings:

```json
{
  "name": "ACE Context Engineering",
  "command": "npx",
  "args": ["tsx", "src/index.ts"],
  "cwd": "$HOME/code/perplexity/ace-mcp-server",
  "env": {
    "LLM_PROVIDER": "deepseek",
    "API_BEARER_TOKEN": "token",
    "ACE_SERVER_PORT": "34301",
    "ACE_CONTEXT_DIR": "$HOME/code/perplexity/ace-mcp-server/contexts",
    "ACE_MAX_PLAYBOOK_SIZE": "10000"
  }
}
```

#### Option B: Through Configuration File

1. Find Cursor configuration file:
   - **macOS**: `~/Library/Application Support/Cursor/User/settings.json`
   - **Linux**: `~/.config/Cursor/User/settings.json`
   - **Windows**: `%APPDATA%\Cursor\User\settings.json`

2. Add MCP settings to the file:

```json
{
  "mcp.servers": {
    "ace-context-engineering": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "$HOME/code/perplexity/ace-mcp-server",
      "env": {
        "LLM_PROVIDER": "deepseek",
        "API_BEARER_TOKEN": "token",
        "ACE_SERVER_PORT": "34301",
        "ACE_CONTEXT_DIR": "$HOME/code/perplexity/ace-mcp-server/contexts",
        "ACE_MAX_PLAYBOOK_SIZE": "10000"
      }
    }
  }
}
```

### 3. 🔄 Restart Cursor AI

After adding configuration:
1. Fully close Cursor AI
2. Start it again
3. Check logs to verify MCP server connected

### 4. ✅ Connection Verification

In Cursor AI, try using commands:

```
@ace-context-engineering generate a Python function for sorting
```

or

```
@ace-context-engineering reflect on this code: def sort_list(arr): return sorted(arr)
```

## 🎯 Available ACE MCP Commands

### 📝 Generator
```
@ace generate <prompt>
```
Generates development trajectories based on prompt.

### 🧠 Reflector  
```
@ace reflect <code>
```
Analyzes code and creates insights for improvement.

### 📚 Curator
```
@ace curate <insights>
```
Updates Playbook with new knowledge.

### 📖 Playbook
```
@ace playbook
```
Shows current Playbook with patterns and best practices.

## 🔧 Environment Settings

Make sure dependencies are installed:

```bash
# In project directory
npm install -g tsx
npm install
```

## 🐛 Troubleshooting

### Problem: MCP Server Not Connecting
**Solution**: 
1. Check that Docker containers are running
2. Make sure port 34301 is free
3. Verify path correctness in configuration

### Problem: Authentication Error
**Solution**:
1. Check Bearer token in `.env` file
2. Ensure token matches in Cursor configuration

### Problem: Commands Not Working
**Solution**:
1. Restart Cursor AI
2. Check MCP server logs: `docker logs ace-mcp-server-dev`
3. Make sure you're using correct command syntax

## 📊 Monitoring

To monitor ACE MCP operation:

1. **Dashboard**: http://localhost:34300
2. **API Status**: http://localhost:34301/health
3. **Docker Logs**: `docker logs -f ace-mcp-server-dev`

## 🚀 Ready!

After setup, ACE MCP will:
- ✅ Generate development trajectories
- ✅ Analyze your code
- ✅ Accumulate knowledge in Playbook
- ✅ Suggest improvements based on experience

Now Cursor AI will use self-improving context for better development assistance! 🎉
