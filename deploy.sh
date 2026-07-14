#!/bin/bash
# ============================================
# The Kilo Factory — Deployment Script for Hostinger
# ============================================
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
#
# This script will:
#   1. Install Node.js dependencies
#   2. Generate Prisma client
#   3. Set up the SQLite database
#   4. Build the Next.js application
#   5. Start the production server
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "============================================"
echo "  The Kilo Factory — Deployment Setup"
echo "============================================"
echo ""

# ---- 1. Check Node.js version ----
echo -e "${YELLOW}[1/6] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed!${NC}"
    echo "Please install Node.js 18+ first."
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}ERROR: Node.js 18+ required. Found $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}  Node.js $(node -v) found ✓${NC}"

# ---- 2. Install dependencies ----
echo ""
echo -e "${YELLOW}[2/6] Installing dependencies...${NC}"
npm install --production=false 2>&1 | tail -5
echo -e "${GREEN}  Dependencies installed ✓${NC}"

# ---- 3. Check .env file ----
echo ""
echo -e "${YELLOW}[3/6] Checking environment configuration...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}  .env created from .env.example${NC}"
        echo -e "${RED}  ⚠ IMPORTANT: Edit .env and set your own values!${NC}"
        echo -e "${RED}  Especially: NEXTAUTH_SECRET, ADMIN_PASSWORD${NC}"
    else
        echo -e "${RED}ERROR: Neither .env nor .env.example found!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}  .env file exists ✓${NC}"
fi

# ---- 4. Generate Prisma client & setup database ----
echo ""
echo -e "${YELLOW}[4/6] Setting up database...${NC}"
npx prisma generate 2>&1 | tail -3

# Create db directory if needed
mkdir -p db

# If no database exists and we have a seed db, copy it
if [ ! -f db/custom.db ] && [ -f db/seed/custom.db ]; then
    cp db/seed/custom.db db/custom.db
    echo -e "${GREEN}  Database seeded from backup ✓${NC}"
elif [ -f db/custom.db ]; then
    echo -e "${GREEN}  Database file exists ✓${NC}"
else
    # Create fresh database from schema
    npx prisma db push --skip-generate 2>&1 | tail -3
    echo -e "${GREEN}  Fresh database created ✓${NC}"
fi

# ---- 5. Build Next.js ----
echo ""
echo -e "${YELLOW}[5/6] Building application...${NC}"
npx next build 2>&1 | tail -10
echo -e "${GREEN}  Build complete ✓${NC}"

# ---- 6. Start server ----
echo ""
echo -e "${YELLOW}[6/6] Starting production server...${NC}"
echo ""
echo "============================================"
echo -e "${GREEN}  The Kilo Factory is ready!${NC}"
echo "============================================"
echo ""
echo "  Starting server on port 3000..."
echo "  Access at: http://localhost:3000"
echo ""
echo "  To run in background:  nohup npm start > logs/app.log 2>&1 &"
echo "  To stop:                pkill -f 'next start'"
echo ""
echo "  Admin login:"
echo "    Email:    (from .env ADMIN_EMAIL)"
echo "    Password: (from .env ADMIN_PASSWORD)"
echo ""
echo "============================================"

# Create logs directory
mkdir -p logs

# Start the server (foreground)
npx next start -p 3000