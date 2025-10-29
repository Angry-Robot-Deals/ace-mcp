#!/bin/bash
# Скрипт для просмотра playbook

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${RED}❌ Please edit .env file and set API_BEARER_TOKEN!${NC}"
    else
        echo -e "${RED}❌ .env.example file not found!${NC}"
    fi
    exit 1
fi

# Load environment variables from .env
# Use grep to extract token value (handles comments and empty lines)
API_BEARER_TOKEN=$(grep "^API_BEARER_TOKEN=" .env | cut -d '=' -f2- | sed "s/^[\"']//; s/[\"']$//" | tr -d ' ')

# Verify bearer token is set
if [ -z "$API_BEARER_TOKEN" ] || [ "$API_BEARER_TOKEN" = "your-secure-bearer-token-here-change-in-production" ]; then
    echo -e "${RED}❌ API_BEARER_TOKEN not set in .env file!${NC}"
    echo -e "${YELLOW}   Please set a secure bearer token in .env${NC}"
    echo -e "${YELLOW}   Example: API_BEARER_TOKEN=your-secure-token${NC}"
    exit 1
fi

# Get API URL from .env or use default
ACE_SERVER_URL=$(grep "^ACE_SERVER_URL=" .env | cut -d '=' -f2- | sed "s/^[\"']//; s/[\"']$//" | tr -d ' ')
if [ -n "$ACE_SERVER_URL" ]; then
    API_URL="${ACE_SERVER_URL}/api/playbook"
else
    # Try to get port from .env
    ACE_SERVER_PORT=$(grep "^ACE_SERVER_PORT=" .env | cut -d '=' -f2- | sed "s/^[\"']//; s/[\"']$//" | tr -d ' ')
    ACE_SERVER_PORT=${ACE_SERVER_PORT:-34301}
    API_URL="http://localhost:${ACE_SERVER_PORT}/api/playbook"
fi

echo -e "${GREEN}📖 ACE MCP Server Playbook${NC}"
echo -e "${GREEN}==========================${NC}"
echo ""

response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $API_BEARER_TOKEN" "$API_URL")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    if command -v python3 &> /dev/null; then
        echo "$body" | python3 -m json.tool
    else
        echo "$body"
    fi
elif [ "$http_code" -eq 401 ]; then
    echo -e "${RED}❌ Unauthorized - Invalid bearer token${NC}"
    exit 1
elif [ "$http_code" -eq 0 ]; then
    echo -e "${RED}❌ Failed to connect to server${NC}"
    echo -e "${YELLOW}   Check if server is running on $API_URL${NC}"
    exit 1
else
    echo -e "${RED}❌ Error: HTTP $http_code${NC}"
    echo "$body"
    exit 1
fi
