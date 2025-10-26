#!/bin/bash

# HomeMaint Production Startup Script for macOS
# This script starts HomeMaint in production mode on your Mac

# Configuration
PORT=3000
APP_NAME="HomeMaint"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  $APP_NAME - Production Mode${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠ No .env.production file found${NC}"
    echo -e "  Creating from template..."
    cp .env.example .env.production
    echo -e "${GREEN}✓ Created .env.production${NC}"
    echo -e "${YELLOW}  You can edit this file to configure Sentry if needed${NC}"
fi

# Check if data directory exists
if [ ! -d "data" ]; then
    echo -e "${YELLOW}Creating data directory...${NC}"
    mkdir -p data/backups
    echo -e "${GREEN}✓ Data directory created${NC}"
fi

# Check if already built
if [ ! -d ".next" ]; then
    echo -e "${YELLOW}Building production bundle...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Build failed!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Build complete${NC}"
fi

# Create backup before starting (if database exists)
if [ -f "data/homemaint.db" ]; then
    echo -e "${YELLOW}Creating backup before startup...${NC}"
    ./scripts/backup.sh
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Starting $APP_NAME...${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  📍 Local:    ${GREEN}http://localhost:$PORT${NC}"
echo -e "  📍 Network:  ${GREEN}http://$(ipconfig getifaddr en0):$PORT${NC}"
echo ""
echo -e "${YELLOW}  Press Ctrl+C to stop${NC}"
echo ""

# Start the production server
NODE_ENV=production npm start
