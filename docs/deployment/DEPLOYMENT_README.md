# 🚀 ACE MCP Server - Quick Deployment Guide

## Prerequisites

- SSH access to production server
- Domain configured in Cloudflare
- Cloudflare SSL/TLS mode: **Full** (not Full Strict)
- DNS A record pointing to server IP (proxied - orange cloud)

## Quick Deploy

### 1. Generate Bearer Token

```bash
openssl rand -hex 32
```

Example output: `7f3d8c9e2a1b4f6e8d5c3a9b7e4f2d1c8a6b4e2f9d7c5a3b1e8f6d4c2a9b7e5f3d`

### 2. Configure Environment

```bash
# Copy example
cp .env.example .env

# Edit .env
nano .env
```

**Required settings:**

```bash
# ===================================
# Security Configuration (REQUIRED)
# ===================================
API_BEARER_TOKEN=your-generated-token-from-step-1

# ===================================
# Production Deployment (REQUIRED)
# ===================================
PRODUCTION_SERVER_IP=$PRODUCTION_SERVER_IP
PRODUCTION_DOMAIN=your-domain.com

# ===================================
# SSH Configuration (OPTIONAL)
# ===================================
PRODUCTION_SSH_KEY=~/.ssh/id_ed25519
PRODUCTION_SERVER_USER=root

# ===================================
# LLM Provider (REQUIRED)
# ===================================
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here

# ===================================
# Environment (REQUIRED)
# ===================================
NODE_ENV=production
```

### 3. Deploy

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment (reads configuration from .env)
./deploy.sh
```

## What the Script Does

1. ✅ Loads configuration from `.env`
2. ✅ Verifies required variables (`API_BEARER_TOKEN`, `PRODUCTION_SERVER_IP`, `PRODUCTION_DOMAIN`)
3. 📦 Builds Docker images locally
4. 📦 Creates deployment package with dynamic Nginx configuration
5. 📤 Uploads to server via SSH (using settings from `.env`)
6. 🐳 Installs Docker & Docker Compose (if needed)
7. 🔧 Configures Nginx with Cloudflare support
8. 🚀 Starts Docker containers
9. ✅ Verifies deployment

## Configuration from .env

The deployment script reads the following variables from `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PRODUCTION_SERVER_IP` | **required** | Server IP address |
| `PRODUCTION_DOMAIN` | **required** | Domain name |
| `PRODUCTION_SSH_KEY` | `~/.ssh/id_ed25519` | SSH key path |
| `PRODUCTION_SERVER_USER` | `root` | SSH username |
| `API_BEARER_TOKEN` | **required** | Authentication token |
| `DASHBOARD_PORT` | `34300` | Dashboard port |
| `ACE_SERVER_PORT` | `34301` | Server port |
| `METRICS_PORT` | `34302` | Metrics port |

## Access Your Deployment

After successful deployment:

- **Dashboard**: `https://{PRODUCTION_DOMAIN}` (public)
- **Health**: `https://{PRODUCTION_DOMAIN}/health` (public)
- **API**: `https://{PRODUCTION_DOMAIN}/api` (requires Bearer token)
- **MCP**: `https://{PRODUCTION_DOMAIN}/mcp` (requires Bearer token)

Example with default settings:
- **Dashboard**: https://your-domain.com
- **Health**: https://your-domain.com/health

## Test Deployment

```bash
# Test dashboard (public)
curl https://your-domain.com

# Test health (public)
curl https://your-domain.com/health

# Test API without token (should fail with 401)
curl https://your-domain.com/api/health

# Test API with token (should succeed)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-domain.com/api/health
```

## Monitor Deployment

```bash
# Load .env for SSH config
source .env

# View logs
ssh -i "$PRODUCTION_SSH_KEY" "$PRODUCTION_SERVER_USER@$PRODUCTION_SERVER_IP" \
  'cd /opt/ace-mcp-server && docker-compose logs -f'

# Check container status
ssh -i "$PRODUCTION_SSH_KEY" "$PRODUCTION_SERVER_USER@$PRODUCTION_SERVER_IP" \
  'cd /opt/ace-mcp-server && docker-compose ps'

# Check Nginx status
ssh -i "$PRODUCTION_SSH_KEY" "$PRODUCTION_SERVER_USER@$PRODUCTION_SERVER_IP" \
  'systemctl status nginx'
```

## Redeploy (Updates)

```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy (uses .env configuration)
./deploy.sh
```

## Multiple Environments

You can maintain different `.env` files for different environments:

```bash
# Development
cp .env.example .env.dev
nano .env.dev  # Configure dev settings

# Staging
cp .env.example .env.staging
nano .env.staging  # Configure staging settings

# Production
cp .env.example .env.prod
nano .env.prod  # Configure production settings

# Deploy to specific environment
cp .env.staging .env
./deploy.sh

cp .env.prod .env
./deploy.sh
```

## Troubleshooting

### Services won't start

```bash
source .env
ssh -i "$PRODUCTION_SSH_KEY" "$PRODUCTION_SERVER_USER@$PRODUCTION_SERVER_IP"
cd /opt/ace-mcp-server
docker-compose logs
docker-compose up -d --build
```

### Nginx 502 Bad Gateway

```bash
# Check if containers are running
docker-compose ps

# Restart services
docker-compose restart
```

### Authentication not working

```bash
# Verify token in .env
cat .env | grep API_BEARER_TOKEN

# Check Nginx logs
tail -f /var/log/nginx/ace-mcp-error.log
```

### Missing environment variables

If deployment fails with missing variables:

```bash
# Check .env file
cat .env

# Verify required variables are set:
# - API_BEARER_TOKEN
# - PRODUCTION_SERVER_IP
# - PRODUCTION_DOMAIN
# - LLM_PROVIDER and its credentials
```

## Security Notes

- ✅ All configuration stored in `.env` (not in code)
- ✅ Bearer token required for all API/MCP requests
- ✅ Dashboard (index page) is public
- ✅ Health endpoint is public
- ✅ SSL/TLS handled by Cloudflare
- ✅ Nginx configured with Cloudflare IP ranges
- ⚠️ Never commit `.env` file to git
- ⚠️ Rotate Bearer token regularly (monthly recommended)
- ⚠️ Use strong SSH keys (ED25519 or RSA 4096)

## Full Documentation

See `docs/intro/DEPLOYMENT.md` for complete deployment guide.

---

<div align="center">
  <sub>Built with ❤️ for production deployments</sub>
</div>
