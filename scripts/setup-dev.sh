#!/bin/bash
set -e

# Kiacha OS Setup Development Environment
# Installs all dependencies and sets up dev environment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "=========================================="
echo "Kiacha OS Development Setup"
echo "=========================================="
echo -e "${NC}"

# Check Node.js
echo -e "${YELLOW}[1/5] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not found. Please install Node.js 20+ from https://nodejs.org${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# Check npm
echo -e "${YELLOW}[2/5] Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm not found.${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"

# Install Frontend dependencies
echo -e "${YELLOW}[3/5] Installing Frontend dependencies...${NC}"
cd "$PROJECT_ROOT/frontend"
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Install Backend dependencies
echo -e "${YELLOW}[4/5] Installing Backend dependencies...${NC}"
cd "$PROJECT_ROOT/backend"
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Check optional tools
echo -e "${YELLOW}[5/5] Checking optional tools...${NC}"

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ ${DOCKER_VERSION}${NC}"
else
    echo -e "${YELLOW}⚠ Docker not found (optional, but recommended)${NC}"
fi

if command -v cmake &> /dev/null; then
    CMAKE_VERSION=$(cmake --version | head -n1)
    echo -e "${GREEN}✓ ${CMAKE_VERSION}${NC}"
else
    echo -e "${YELLOW}⚠ CMake not found (needed for firmware build)${NC}"
fi

if command -v git &> /dev/null; then
    echo -e "${GREEN}✓ Git installed${NC}"
else
    echo -e "${YELLOW}⚠ Git not found${NC}"
fi

# Summary
echo -e "${GREEN}"
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo -e "${NC}"
echo "Next steps:"
echo "  1. Frontend dev: cd frontend && npm run dev"
echo "  2. Backend dev:  cd backend && npm run dev"
echo "  3. Full stack:   make run-web"
echo "  4. Build all:    make build-all"
echo ""
