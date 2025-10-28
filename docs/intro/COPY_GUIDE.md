# Quick Copy Guide

This guide helps you quickly copy all source files from the Perplexity chat.

## Where to Find Source Code

All TypeScript source code is in document **[88]** "ace-mcp-complete-source.md" in your Perplexity chat.

## Files to Copy

### ✅ Already Created
- package.json
- tsconfig.json
- .env.example
- .gitignore  
- README.md
- INSTALLATION.md

### 📋 Need to Copy from [88]

#### 1. src/storage/bullet.ts
```bash
# Search for: "## FILE: src/storage/bullet.ts"
# Copy everything between the code blocks
```

#### 2. src/storage/embeddings.ts
```bash
# Search for: "## FILE: src/storage/embeddings.ts"
```

#### 3. src/storage/deduplicator.ts  
```bash
# Search for: "## FILE: src/storage/deduplicator.ts"
```

#### 4. src/core/playbook.ts
```bash
# Search for: "## FILE: src/core/playbook.ts"
```

#### 5. src/core/generator.ts
```bash
# Search for: "## FILE: src/core/generator.ts"
```

#### 6. src/core/reflector.ts
```bash
# Search for: "## FILE: src/core/reflector.ts"
```

#### 7. src/core/curator.ts
```bash
# Search for: "## FILE: src/core/curator.ts"
```

#### 8. src/mcp/tools.ts
```bash
# Search for: "## FILE: src/mcp/tools.ts"
```

#### 9. src/mcp/server.ts
```bash
# Search for: "## FILE: src/mcp/server.ts"
```

#### 10. src/utils/config.ts
```bash
# Search for: "## FILE: src/utils/config.ts"
```

#### 11. src/utils/logger.ts
```bash
# Search for: "## FILE: src/utils/logger.ts"
```

#### 12. src/utils/errors.ts
```bash
# Search for: "## FILE: src/utils/errors.ts"
```

#### 13. src/index.ts
```bash
# Search for: "## FILE: src/index.ts"
```

## Copy Method

### Option 1: Manual Copy (Recommended)

1. Open document [88] in Perplexity chat
2. Search for each file header (e.g., "## FILE: src/storage/bullet.ts")
3. Copy the TypeScript code between the triple backticks
4. Paste into the corresponding file

### Option 2: Using Cursor AI

1. Open Cursor in this directory
2. Ask Cursor: "Copy all TypeScript code from Perplexity document [88] to the appropriate files"
3. Cursor can help extract and organize the code

### Option 3: Script (Advanced)

If you have the markdown file saved:

```bash
# Extract code blocks from markdown
# (You'll need to create a script or use a tool like `csplit`)
```

## Verify Installation

After copying all files:

```bash
# Check file structure
find src -name "*.ts" | sort

# Should show:
# src/core/curator.ts
# src/core/generator.ts
# src/core/playbook.ts
# src/core/reflector.ts
# src/index.ts
# src/mcp/server.ts
# src/mcp/tools.ts
# src/storage/bullet.ts
# src/storage/deduplicator.ts
# src/storage/embeddings.ts
# src/utils/config.ts
# src/utils/errors.ts
# src/utils/logger.ts

# Install and build
npm install
npm run build

# Should compile without errors
```

## Download PDFs

### User Guide
- Document [85] in Perplexity chat
- Save as: `docs/USER_GUIDE.pdf`

### Admin Guide  
- Document [86] in Perplexity chat
- Save as: `docs/ADMIN_GUIDE.pdf`

### LinkedIn Post
- Document [42] in Perplexity chat
- Optional: Save as `docs/linkedin-post.md`

## Next Steps

Once all files are copied:

1. ✅ Run `npm install`
2. ✅ Run `npm run build`
3. ✅ Configure Cursor AI (see INSTALLATION.md)
4. ✅ Test with `npm start`
5. ✅ Restart Cursor and start using ACE!

## Quick Test

After setup, test in Cursor:

```
Using ACE, create a simple Express.js API endpoint
```

The server should:
- Generate code
- Track bullet usage
- Allow reflection
- Update playbook

---

For detailed instructions, see INSTALLATION.md
