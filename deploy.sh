#!/bin/bash

# ACE MCP Server Production Deployment Script
# Configuration loaded from .env file

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}ACE MCP Server Production Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}❌ Please edit .env file with your production settings before deploying!${NC}"
    echo -e "${YELLOW}   Especially set:${NC}"
    echo -e "${YELLOW}   - API_BEARER_TOKEN (for authentication)${NC}"
    echo -e "${YELLOW}   - PRODUCTION_SERVER_IP${NC}"
    echo -e "${YELLOW}   - PRODUCTION_DOMAIN${NC}"
    echo -e "${YELLOW}   - LLM provider credentials${NC}"
    exit 1
fi

# Load environment variables
source .env

# Configuration from .env
SERVER_USER="${PRODUCTION_SERVER_USER:-root}"
SERVER_IP="${PRODUCTION_SERVER_IP}"
SSH_KEY="${PRODUCTION_SSH_KEY:-~/.ssh/id_ed25519}"
DOMAIN="${PRODUCTION_DOMAIN}"
DEPLOY_DIR="/opt/ace-mcp-server"
NGINX_CONF="/etc/nginx/sites-available/ace-mcp"

# Verify required variables
if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}❌ PRODUCTION_SERVER_IP not set in .env file!${NC}"
    exit 1
fi

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ PRODUCTION_DOMAIN not set in .env file!${NC}"
    exit 1
fi

# Verify bearer token is set
if ! grep -q "^API_BEARER_TOKEN=.\+" .env; then
    echo -e "${RED}❌ API_BEARER_TOKEN not set in .env file!${NC}"
    echo -e "${YELLOW}   Please set a secure bearer token in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment configuration verified${NC}"
echo -e "${YELLOW}   Server: $SERVER_IP${NC}"
echo -e "${YELLOW}   Domain: $DOMAIN${NC}"

# Build Docker images locally
echo ""
echo -e "${YELLOW}📦 Building Docker images...${NC}"
docker-compose build

echo -e "${GREEN}✓ Docker images built successfully${NC}"

# Create deployment package
echo ""
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
TEMP_DIR=$(mktemp -d)
mkdir -p "$TEMP_DIR/ace-mcp-server"

# Copy necessary files
cp -r src "$TEMP_DIR/ace-mcp-server/"
cp -r dashboard "$TEMP_DIR/ace-mcp-server/"
cp package*.json "$TEMP_DIR/ace-mcp-server/"
cp tsconfig.json "$TEMP_DIR/ace-mcp-server/"
cp docker-compose.yml "$TEMP_DIR/ace-mcp-server/"
cp Dockerfile "$TEMP_DIR/ace-mcp-server/"
cp dashboard/Dockerfile "$TEMP_DIR/ace-mcp-server/dashboard/"
cp .env "$TEMP_DIR/ace-mcp-server/"
cp .dockerignore "$TEMP_DIR/ace-mcp-server/" 2>/dev/null || true

# Create nginx configuration (HTTP only - Cloudflare handles SSL)
cat > "$TEMP_DIR/ace-mcp-server/nginx.conf" << NGINX_EOF
server {
    listen 80;
    server_name $DOMAIN;

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

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/ace-mcp-access.log;
    error_log /var/log/nginx/ace-mcp-error.log;

    # Root location - public access (dashboard)
    location / {
        proxy_pass http://localhost:${DASHBOARD_PORT:-34300};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header CF-Connecting-IP \$http_cf_connecting_ip;
    }

    # API endpoints - require bearer token
    location /api/ {
        # Check for bearer token
        if (\$http_authorization = "") {
            return 401 '{"error": "Unauthorized", "message": "Bearer token required"}';
        }

        # Validate bearer token (this will be done by the app)
        proxy_pass http://localhost:${ACE_SERVER_PORT:-34301};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Authorization \$http_authorization;
        proxy_set_header CF-Connecting-IP \$http_cf_connecting_ip;
        
        # Timeouts for long-running requests
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # MCP endpoints - require bearer token
    location /mcp/ {
        # Check for bearer token
        if (\$http_authorization = "") {
            return 401 '{"error": "Unauthorized", "message": "Bearer token required"}';
        }

        proxy_pass http://localhost:${ACE_SERVER_PORT:-34301};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Authorization \$http_authorization;
        proxy_set_header CF-Connecting-IP \$http_cf_connecting_ip;
        
        # Timeouts for long-running requests
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Health check endpoint - public access
    location /health {
        proxy_pass http://localhost:${ACE_SERVER_PORT:-34301}/health;
        access_log off;
    }

    # Metrics endpoint - require bearer token
    location /metrics {
        # Check for bearer token
        if (\$http_authorization = "") {
            return 401 '{"error": "Unauthorized", "message": "Bearer token required"}';
        }

        proxy_pass http://localhost:${METRICS_PORT:-34302};
        proxy_set_header Authorization \$http_authorization;
    }
}
NGINX_EOF

# Create deployment script for server
cat > "$TEMP_DIR/ace-mcp-server/server-deploy.sh" << SERVER_DEPLOY_EOF
#!/bin/bash

set -e

echo "🚀 Starting ACE MCP Server deployment..."

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get update
    apt-get install -y nginx
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
cd /opt/ace-mcp-server
docker-compose down || true

# Pull latest images and start
echo "🚀 Starting containers..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Containers are running"
else
    echo "❌ Containers failed to start"
    docker-compose logs
    exit 1
fi

# Setup nginx
echo "🔧 Configuring Nginx..."
cp nginx.conf /etc/nginx/sites-available/ace-mcp
ln -sf /etc/nginx/sites-available/ace-mcp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx

echo "✅ Deployment complete!"
echo ""
echo "🌐 Service URLs:"
echo "   Dashboard: https://$DOMAIN (via Cloudflare)"
echo "   API: https://$DOMAIN/api"
echo "   MCP: https://$DOMAIN/mcp"
echo "   Health: https://$DOMAIN/health"
echo ""
echo "🔑 Remember to use Bearer token for API/MCP requests"
echo "   Example: curl -H 'Authorization: Bearer YOUR_TOKEN' https://$DOMAIN/api/health"
SERVER_DEPLOY_EOF

chmod +x "$TEMP_DIR/ace-mcp-server/server-deploy.sh"

echo -e "${GREEN}✓ Deployment package created${NC}"

# Create archive
echo ""
echo -e "${YELLOW}📦 Creating deployment archive...${NC}"
cd "$TEMP_DIR"
tar -czf ace-mcp-deploy.tar.gz ace-mcp-server/

echo -e "${GREEN}✓ Deployment archive created${NC}"

# Upload to server
echo ""
echo -e "${YELLOW}📤 Uploading to server...${NC}"
scp -i "$SSH_KEY" ace-mcp-deploy.tar.gz "$SERVER_USER@$SERVER_IP:/tmp/"

echo -e "${GREEN}✓ Files uploaded${NC}"

# Deploy on server
echo ""
echo -e "${YELLOW}🚀 Deploying on server...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << 'REMOTE_COMMANDS'
set -e

# Create deployment directory
mkdir -p /opt/ace-mcp-server

# Extract archive
cd /opt
tar -xzf /tmp/ace-mcp-deploy.tar.gz
rm /tmp/ace-mcp-deploy.tar.gz

# Run deployment script
cd /opt/ace-mcp-server
chmod +x server-deploy.sh
./server-deploy.sh

echo ""
echo "✅ Deployment completed successfully!"
REMOTE_COMMANDS

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}🌐 Your ACE MCP Server is now running at:${NC}"
echo -e "${GREEN}   https://$DOMAIN${NC}"
echo -e "${YELLOW}   (SSL handled by Cloudflare)${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "   1. Test the dashboard: https://$DOMAIN"
echo -e "   2. Test API with bearer token:"
echo -e "      curl -H 'Authorization: Bearer YOUR_TOKEN' https://$DOMAIN/api/health"
echo -e "   3. Monitor logs:"
echo -e "      ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'cd /opt/ace-mcp-server && docker-compose logs -f'"
echo ""
echo -e "${YELLOW}⚠️  Cloudflare Configuration:${NC}"
echo -e "   - SSL/TLS mode: Full (not Full Strict)"
echo -e "   - Proxy status: Proxied (orange cloud)"
echo -e "   - DNS A record: $SERVER_IP"
echo ""
