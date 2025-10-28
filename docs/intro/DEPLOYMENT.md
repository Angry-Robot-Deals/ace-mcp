# 🚀 ACE MCP Server - Production Deployment Guide

Complete guide for deploying ACE MCP Server to production with Docker, Nginx, and Cloudflare SSL.

---

## 📋 Prerequisites

### Server Requirements
- Ubuntu 20.04+ or Debian 11+
- 2+ CPU cores
- 4GB+ RAM
- 20GB+ disk space
- Root or sudo access

### Local Requirements
- SSH access to production server
- SSH key configured (`~/.ssh/id_ed25519`)
- Docker and Docker Compose installed locally
- Git repository cloned

### Domain & SSL
- Domain configured in Cloudflare
- DNS A record pointing to server IP
- Cloudflare proxy enabled (orange cloud)
- SSL/TLS mode: **Full** (not Full Strict)

---

## 🔐 Security Setup

### 1. Generate Bearer Token

Generate a secure random token for API authentication:

```bash
# Using openssl
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Example output:
# 7f3d8c9e2a1b4f6e8d5c3a9b7e4f2d1c8a6b4e2f9d7c5a3b1e8f6d4c2a9b7e5f3d
```

### 2. Configure Environment

Edit `.env` file with your production settings:

```bash
# Copy example
cp .env.example .env

# Edit with your settings
nano .env
```

**Critical settings:**

```bash
# API Authentication (REQUIRED)
API_BEARER_TOKEN=your-generated-token-here

# LLM Provider (choose one)
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here

# Production settings
NODE_ENV=production
ACE_LOG_LEVEL=info

# Server configuration
PRODUCTION_SERVER_IP=$PRODUCTION_SERVER_IP
PRODUCTION_DOMAIN=your-domain.com
```

---

## 🚀 Deployment Process

### Automated Deployment

The deployment script handles everything automatically:

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The script will:
1. ✅ Verify environment configuration
2. 📦 Build Docker images locally
3. 📦 Create deployment package
4. 📤 Upload to production server
5. 🐳 Install Docker & Docker Compose
6. 🔧 Configure Nginx
7. 🚀 Start services
8. ✅ Verify deployment

### Manual Deployment

If you prefer manual control:

#### 1. Prepare Deployment Package

```bash
# Build Docker images
docker-compose build

# Create deployment directory
mkdir -p deploy-package
cp -r src dashboard package*.json tsconfig.json docker-compose.yml Dockerfile .env deploy-package/

# Create archive
tar -czf ace-mcp-deploy.tar.gz deploy-package/
```

#### 2. Upload to Server

```bash
# Upload archive
scp -i ~/.ssh/id_ed25519 ace-mcp-deploy.tar.gz root@$PRODUCTION_SERVER_IP:/tmp/

# Connect to server
ssh -i ~/.ssh/id_ed25519 root@$PRODUCTION_SERVER_IP
```

#### 3. Install Dependencies (on server)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx
apt-get update
apt-get install -y nginx
```

#### 4. Extract and Deploy

```bash
# Extract archive
mkdir -p /opt/ace-mcp-server
cd /opt
tar -xzf /tmp/ace-mcp-deploy.tar.gz
mv deploy-package/* /opt/ace-mcp-server/

# Start services
cd /opt/ace-mcp-server
docker-compose up -d
```

#### 5. Configure Nginx

Create `/etc/nginx/sites-available/ace-mcp`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Trust Cloudflare proxy headers
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    real_ip_header CF-Connecting-IP;

    # Root location - public access (dashboard)
    location / {
        proxy_pass http://localhost:34300;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API endpoints - require bearer token
    location /api/ {
        if ($http_authorization = "") {
            return 401 '{"error": "Unauthorized", "message": "Bearer token required"}';
        }

        proxy_pass http://localhost:34301;
        proxy_http_version 1.1;
        proxy_set_header Authorization $http_authorization;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Health check - public access
    location /health {
        proxy_pass http://localhost:34301/health;
        access_log off;
    }
}
```

Enable site:

```bash
ln -sf /etc/nginx/sites-available/ace-mcp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

---

## ☁️ Cloudflare Configuration

### DNS Settings

1. Go to Cloudflare Dashboard → DNS
2. Add A record:
   - **Name**: `ace-mcp`
   - **IPv4 address**: `$PRODUCTION_SERVER_IP`
   - **Proxy status**: ✅ Proxied (orange cloud)
   - **TTL**: Auto

### SSL/TLS Settings

1. Go to SSL/TLS → Overview
2. Set encryption mode: **Full** (not Full Strict)
3. Enable:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - ✅ Opportunistic Encryption

### Security Settings

1. Go to Security → Settings
2. Security Level: **Medium**
3. Challenge Passage: **30 minutes**
4. Browser Integrity Check: ✅ Enabled

### Firewall Rules (Optional)

Create rule to allow only API requests with Bearer token:

```
(http.request.uri.path contains "/api/" or http.request.uri.path contains "/mcp/") and not http.request.headers["authorization"] contains "Bearer"
```

Action: **Block**

---

## 🧪 Testing Deployment

### 1. Test Dashboard (Public)

```bash
# Should return HTML
curl https://your-domain.com

# Or open in browser
open https://your-domain.com
```

### 2. Test Health Endpoint (Public)

```bash
# Should return {"status": "healthy"}
curl https://your-domain.com/health
```

### 3. Test API Without Token (Should Fail)

```bash
# Should return 401 Unauthorized
curl https://your-domain.com/api/generate
```

### 4. Test API With Token (Should Succeed)

```bash
# Replace YOUR_TOKEN with your API_BEARER_TOKEN
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-domain.com/api/health
```

### 5. Test MCP Endpoint

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"method": "tools/list"}' \
     https://your-domain.com/mcp/
```

---

## 📊 Monitoring

### View Logs

```bash
# All services
ssh -i ~/.ssh/id_ed25519 root@$PRODUCTION_SERVER_IP \
  'cd /opt/ace-mcp-server && docker-compose logs -f'

# Specific service
ssh -i ~/.ssh/id_ed25519 root@$PRODUCTION_SERVER_IP \
  'cd /opt/ace-mcp-server && docker-compose logs -f ace-server'

# Nginx logs
ssh -i ~/.ssh/id_ed25519 root@$PRODUCTION_SERVER_IP \
  'tail -f /var/log/nginx/ace-mcp-access.log'
```

### Check Service Status

```bash
# Docker containers
ssh -i ~/.ssh/id_ed25519 root@$PRODUCTION_SERVER_IP \
  'cd /opt/ace-mcp-server && docker-compose ps'

# Nginx status
ssh -i ~/.ssh/id_ed25519 root@$PRODUCTION_SERVER_IP \
  'systemctl status nginx'
```

### Resource Usage

```bash
# Container stats
ssh -i ~/.ssh/id_ed25519 root@$PRODUCTION_SERVER_IP \
  'docker stats'

# Server resources
ssh -i ~/.ssh/id_ed25519 root@$PRODUCTION_SERVER_IP \
  'htop'
```

---

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
./deploy.sh
```

### Restart Services

```bash
ssh -i ~/.ssh/id_ed25519 root@$PRODUCTION_SERVER_IP \
  'cd /opt/ace-mcp-server && docker-compose restart'
```

### Backup Data

```bash
# Backup contexts
ssh -i ~/.ssh/id_ed25519 root@$PRODUCTION_SERVER_IP \
  'cd /opt/ace-mcp-server && tar -czf backup-$(date +%Y%m%d).tar.gz contexts/'

# Download backup
scp -i ~/.ssh/id_ed25519 \
  root@$PRODUCTION_SERVER_IP:/opt/ace-mcp-server/backup-*.tar.gz \
  ./backups/
```

### Rotate Bearer Token

1. Generate new token:
   ```bash
   openssl rand -hex 32
   ```

2. Update `.env` on server:
   ```bash
   ssh -i ~/.ssh/id_ed25519 root@$PRODUCTION_SERVER_IP
   cd /opt/ace-mcp-server
   nano .env  # Update API_BEARER_TOKEN
   docker-compose restart
   ```

3. Update clients with new token

---

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check Docker status
docker ps -a

# Rebuild images
docker-compose up -d --build
```

### Nginx 502 Bad Gateway

```bash
# Check if containers are running
docker-compose ps

# Check container logs
docker-compose logs ace-server

# Restart services
docker-compose restart
```

### Authentication Not Working

```bash
# Verify token in .env
cat .env | grep API_BEARER_TOKEN

# Check Nginx logs
tail -f /var/log/nginx/ace-mcp-error.log

# Test with curl
curl -v -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-domain.com/api/health
```

### Cloudflare SSL Issues

1. Check SSL/TLS mode is **Full** (not Full Strict)
2. Verify DNS record is proxied (orange cloud)
3. Clear Cloudflare cache
4. Check Nginx is listening on port 80

---

## 📞 Support

- 📧 Email: support@example.com
- 💬 GitHub Issues: [Angry-Robot-Deals/ace-mcp](https://github.com/Angry-Robot-Deals/ace-mcp/issues)
- 📖 Documentation: `docs/intro/`

---

## 🔒 Security Best Practices

1. ✅ Use strong Bearer tokens (32+ random bytes)
2. ✅ Rotate tokens regularly (monthly)
3. ✅ Enable Cloudflare WAF rules
4. ✅ Monitor access logs for suspicious activity
5. ✅ Keep Docker images updated
6. ✅ Use environment variables for secrets
7. ✅ Enable automatic backups
8. ✅ Restrict SSH access (key-only, no password)

---

<div align="center">
  <sub>Built with ❤️ for production deployments</sub>
</div>
