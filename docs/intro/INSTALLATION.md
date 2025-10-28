# ACE MCP Server - Installation Instructions

## ✅ What's Already Created

The following files and directories have been created:

```
$HOME/code/perplexity/ace-mcp-server/
├── package.json          ✅ Created
├── tsconfig.json         ✅ Created
├── .env.example          ✅ Created
├── .gitignore            ✅ Created
├── README.md             ✅ Created
├── INSTALLATION.md       ✅ This file
├── src/
│   ├── core/             ✅ Directory created
│   ├── mcp/              ✅ Directory created
│   ├── storage/          ✅ Directory created
│   └── utils/            ✅ Directory created
└── docs/                 ✅ Directory created
```

## 📋 Next Steps

### Step 1: Copy TypeScript Source Files

You need to copy the TypeScript source code from the Perplexity chat response.

Find document **[88]** "ace-mcp-complete-source.md" in the chat and copy each file:

#### Core Components (src/core/)

1. **generator.ts** - Copy from document [88] to:
   ```
   src/core/generator.ts
   ```

2. **reflector.ts** - Copy from document [88] to:
   ```
   src/core/reflector.ts
   ```

3. **curator.ts** - Copy from document [88] to:
   ```
   src/core/curator.ts
   ```

4. **playbook.ts** - Copy from document [88] to:
   ```
   src/core/playbook.ts
   ```

#### Storage Layer (src/storage/)

5. **bullet.ts** - Copy from document [88] to:
   ```
   src/storage/bullet.ts
   ```

6. **embeddings.ts** - Copy from document [88] to:
   ```
   src/storage/embeddings.ts
   ```

7. **deduplicator.ts** - Copy from document [88] to:
   ```
   src/storage/deduplicator.ts
   ```

#### MCP Protocol (src/mcp/)

8. **server.ts** - Copy from document [88] to:
   ```
   src/mcp/server.ts
   ```

9. **tools.ts** - Copy from document [88] to:
   ```
   src/mcp/tools.ts
   ```

#### Utilities (src/utils/)

10. **config.ts** - Copy from document [88] to:
    ```
    src/utils/config.ts
    ```

11. **logger.ts** - Copy from document [88] to:
    ```
    src/utils/logger.ts
    ```

12. **errors.ts** - Copy from document [88] to:
    ```
    src/utils/errors.ts
    ```

#### Entry Point (src/)

13. **index.ts** - Copy from document [88] to:
    ```
    src/index.ts
    ```

### Step 2: Copy Documentation

Download PDF documentation from the chat:

1. **User Guide** - Document [85], save to:
   ```
   docs/USER_GUIDE.pdf
   ```

2. **Admin Guide** - Document [86], save to:
   ```
   docs/ADMIN_GUIDE.pdf
   ```

### Step 3: Install Dependencies

In the terminal, navigate to the project directory and run:

```bash
cd $HOME/code/perplexity/ace-mcp-server
npm install
```

This will install:
- @modelcontextprotocol/sdk
- fs-extra
- uuid
- TypeScript and other dev dependencies

### Step 4: Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Step 5: Configure Cursor AI

Edit `~/.cursor/mcp.json` and add:

```json
{
  "mcpServers": {
    "ace-context-engine": {
      "command": "node",
      "args": ["$HOME/code/perplexity/ace-mcp-server/dist/index.js"],
      "env": {
        "ACE_CONTEXT_DIR": "$HOME/code/perplexity/ace-mcp-server/contexts",
        "ACE_LOG_LEVEL": "info",
        "ACE_DEDUP_THRESHOLD": "0.85"
      }
    }
  }
}
```

### Step 6: Test the Server

```bash
# Test standalone
npm start

# Or in development mode
npm run dev
```

### Step 7: Restart Cursor

Restart Cursor AI to load the new MCP server.

## 🚀 Usage in Cursor

Once configured, you can use ACE in Cursor:

```
Using ACE, help me create a secure authentication endpoint
```

The server will:
1. Generate code using your playbook
2. Track helpful/harmful strategies
3. Allow reflection and updates
4. Build knowledge over time

## 📚 Quick Reference

### Available Tools

- `ace_generate` - Generate using playbook
- `ace_reflect` - Analyze trajectory
- `ace_curate` - Create delta updates
- `ace_update_playbook` - Apply updates
- `ace_get_playbook` - View playbook
- `ace_reset_playbook` - Clear context

### Directory Structure After Build

```
ace-mcp-server/
├── dist/                 # Compiled JavaScript (after build)
├── contexts/             # Playbook storage (created automatically)
├── node_modules/         # Dependencies (after npm install)
└── [other files...]
```

## 🔧 Troubleshooting

### If build fails:

1. Check that all TypeScript files are copied correctly
2. Verify Node.js version: `node --version` (should be >=18)
3. Delete `node_modules` and `dist`, then:
   ```bash
   npm install
   npm run build
   ```

### If MCP server doesn't connect:

1. Check Cursor MCP configuration path
2. Verify server starts: `npm start`
3. Check logs in Cursor: Settings → Developer → View MCP Logs
4. Ensure `dist/index.js` exists after build

## 📖 Additional Resources

- Research Paper: https://arxiv.org/pdf/2510.04618
- User Guide: See `docs/USER_GUIDE.pdf`
- Admin Guide: See `docs/ADMIN_GUIDE.pdf`
- LinkedIn Post: Document [42] in chat

## ✨ Features to Implement

The current implementation has mock LLM responses. To enable full functionality:

1. Add OpenAI/Anthropic API keys to `.env`
2. Replace TODO comments in:
   - `src/core/generator.ts`
   - `src/core/reflector.ts`
   - `src/core/curator.ts`
3. Integrate actual LLM API calls

See README.md for integration examples.

---

**Project Created**: October 26, 2025  
**Location**: $HOME/code/perplexity/ace-mcp-server  
**Status**: Configuration complete, source files need to be copied
