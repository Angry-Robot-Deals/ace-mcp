# Multi-stage build for production
FROM node:lts AS builder

# Update npm to latest version
RUN npm install -g npm@latest

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:lts-slim

# Update npm to latest version
RUN npm install -g npm@latest

WORKDIR /app

# Create non-root user
RUN groupadd -r app && useradd -r -g app app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create necessary directories and set permissions
RUN mkdir -p contexts logs && chown -R app:app /app

# Switch to non-root user
USER app

# Expose port
EXPOSE 34301

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:34301/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "dist/index.js"]
