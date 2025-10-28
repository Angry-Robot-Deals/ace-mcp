# ACE MCP Server - Assets Checklist

## 📁 Project Location

```
$HOME/code/perplexity/ace-mcp-server
```

## ✅ Created Files (Ready to Use)

### Configuration Files
- [x] `package.json` - NPM dependencies and scripts
- [x] `tsconfig.json` - TypeScript compiler configuration
- [x] `.env.example` - Environment variables template
- [x] `.gitignore` - Git ignore rules

### Documentation
- [x] `README.md` - Project overview and quick start
- [x] `INSTALLATION.md` - Detailed installation instructions  
- [x] `docs/COPY_GUIDE.md` - Guide for copying source files
- [x] `ASSETS_CHECKLIST.md` - This file

### Directory Structure
- [x] `src/` - Source code directory
- [x] `src/core/` - ACE core components
- [x] `src/mcp/` - MCP protocol implementation
- [x] `src/storage/` - Storage and deduplication
- [x] `src/utils/` - Utility functions
- [x] `docs/` - Documentation directory

## 📋 Files to Download from Perplexity Chat

### TypeScript Source Code

All source code is in document **[88]** "ace-mcp-complete-source.md"

Copy these files from [88]:

#### Storage Layer
- [ ] `src/storage/bullet.ts` (220 lines)
- [ ] `src/storage/embeddings.ts` (110 lines)
- [ ] `src/storage/deduplicator.ts` (130 lines)

#### Core Components
- [ ] `src/core/playbook.ts` (260 lines)
- [ ] `src/core/generator.ts` (80 lines)
- [ ] `src/core/reflector.ts` (90 lines)
- [ ] `src/core/curator.ts` (110 lines)

#### MCP Protocol
- [ ] `src/mcp/tools.ts` (90 lines)
- [ ] `src/mcp/server.ts` (200 lines)

#### Utilities
- [ ] `src/utils/config.ts` (20 lines)
- [ ] `src/utils/logger.ts` (50 lines)
- [ ] `src/utils/errors.ts` (30 lines)

#### Entry Point
- [ ] `src/index.ts` (25 lines)

**Total: ~1,415 lines of TypeScript code**

### PDF Documentation

- [ ] Download **[85]** "User Guide" (15 pages) → `docs/USER_GUIDE.pdf`
- [ ] Download **[86]** "Admin Guide" (23 pages) → `docs/ADMIN_GUIDE.pdf`

### Optional Assets

- [ ] Download **[42]** "LinkedIn Post" → `docs/linkedin-post.md`
- [ ] Download **[84]** "Web Dashboard" (demo only, not needed for production)

## 🚀 Installation Steps

### 1. Copy Source Files
```bash
# Open document [88] in Perplexity
# Copy each TypeScript file to the appropriate location
# See docs/COPY_GUIDE.md for detailed instructions
```

### 2. Install Dependencies
```bash
cd $HOME/code/perplexity/ace-mcp-server
npm install
```

This will install:
- `@modelcontextprotocol/sdk` (^0.5.0)
- `fs-extra` (^11.2.0)
- `uuid` (^9.0.1)
- `typescript` (^5.3.3)
- `ts-node` (^10.9.2)
- `@types/node`, `@types/uuid`

### 3. Build Project
```bash
npm run build
```

Creates `dist/` directory with compiled JavaScript.

### 4. Configure Cursor AI

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ace-context-engine": {
      "command": "node",
      "args": ["$HOME/code/perplexity/ace-mcp-server/dist/index.js"],
      "env": {
        "ACE_CONTEXT_DIR": "$HOME/code/perplexity/ace-mcp-server/contexts",
        "ACE_LOG_LEVEL": "info"
      }
    }
  }
}
```

### 5. Test Server
```bash
# Standalone test
npm start

# Development mode with auto-reload
npm run dev
```

### 6. Restart Cursor
- Close Cursor AI completely
- Reopen Cursor
- MCP server should auto-connect

## 📊 Progress Tracking

### Phase 1: Setup (✅ Complete)
- ✅ Project directory created
- ✅ Configuration files created
- ✅ Documentation created
- ✅ Directory structure ready

### Phase 2: Source Code (In Progress)
- [ ] Copy 13 TypeScript files from [88]
- [ ] Verify all imports are correct
- [ ] Run `npm install`
- [ ] Run `npm run build` successfully

### Phase 3: Documentation (Pending)
- [ ] Download User Guide PDF
- [ ] Download Admin Guide PDF
- [ ] Optional: Download LinkedIn post

### Phase 4: Configuration (Pending)
- [ ] Create `.env` from `.env.example`
- [ ] Configure Cursor MCP settings
- [ ] Test server startup

### Phase 5: Testing (Pending)
- [ ] Restart Cursor AI
- [ ] Test `ace_generate` tool
- [ ] Test `ace_reflect` tool
- [ ] Test `ace_curate` tool
- [ ] Test `ace_update_playbook` tool
- [ ] Verify playbook persistence

## 🔗 Quick Links to Perplexity Assets

In your current Perplexity chat, find these documents:

- **[42]** - LinkedIn Post (English)
- **[84]** - Web Dashboard (demo)
- **[85]** - User Guide PDF (15 pages)
- **[86]** - Admin Guide PDF (23 pages)
- **[87]** - README (already created here)
- **[88]** - Complete TypeScript Source Code

## 📝 File Size Estimates

- Source code: ~1,415 lines (~60 KB)
- User Guide PDF: ~403 KB
- Admin Guide PDF: ~581 KB
- Total project after build: ~5-10 MB

## ⚙️ Key Features Implemented

- ✅ Three-component ACE architecture
- ✅ Incremental delta updates
- ✅ Semantic deduplication (TF-IDF)
- ✅ Multi-context support
- ✅ Persistent JSON storage
- ✅ MCP protocol compliance
- ✅ Full TypeScript typing
- ✅ Structured logging
- ✅ Error handling
- ✅ Configuration management

## 🐛 Known Limitations

- Generator, Reflector, and Curator use mock implementations
- Replace TODO comments with actual LLM API calls (OpenAI/Anthropic)
- TF-IDF embeddings are basic (upgrade to proper embedding APIs for production)
- No authentication built-in (add if exposing HTTP endpoint)

## 📚 Additional Resources

### Research Paper
- **Title**: "Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models"
- **Authors**: Stanford University & SambaNova Systems
- **Link**: https://arxiv.org/pdf/2510.04618
- **Results**: +10.6% accuracy, -86.9% latency

### Documentation
- User Guide: Complete usage instructions
- Admin Guide: Production deployment guide
- README.md: Quick start and overview

### Community
- GitHub: (Create repository and push this code)
- LinkedIn: Share post from [42]

## ✅ Verification Checklist

Before first use, verify:

```bash
# 1. All source files exist
find src -name "*.ts" | wc -l
# Should output: 13

# 2. Dependencies installed
ls node_modules/@modelcontextprotocol/sdk
# Should exist

# 3. Build successful
ls dist/index.js
# Should exist

# 4. Configuration valid
node -e "require('./dist/index.js')"
# Should start without errors (Ctrl+C to exit)

# 5. Cursor config exists
cat ~/.cursor/mcp.json | grep ace-context-engine
# Should show configuration
```

## 🎉 Ready to Use!

Once all checkboxes above are complete, you're ready to use ACE in Cursor AI!

Test with:
```
Using ACE, help me build a REST API with authentication
```

---

**Project Status**: Configuration complete, awaiting source code copy  
**Next Step**: Copy TypeScript files from document [88]  
**Created**: October 26, 2025
