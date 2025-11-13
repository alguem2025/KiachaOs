#!/bin/bash
set -e

# Kiacha OS Build Script
# Compila frontend, backend e firmware

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=========================================="
echo "Kiacha OS Build System"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

build_frontend() {
    echo -e "${YELLOW}[1/3] Building Frontend...${NC}"
    cd "$PROJECT_ROOT/frontend"
    npm install --production
    npm run build
    echo -e "${GREEN}✓ Frontend build complete${NC}"
}

build_backend() {
    echo -e "${YELLOW}[2/3] Building Backend...${NC}"
    cd "$PROJECT_ROOT/backend"
    npm install --production
    npm run build
    echo -e "${GREEN}✓ Backend build complete${NC}"
}

build_firmware() {
    echo -e "${YELLOW}[3/3] Building Firmware...${NC}"
    if ! command -v cmake &> /dev/null; then
        echo -e "${RED}cmake not found. Install cmake and try again.${NC}"
        return 1
    fi
    
    cd "$PROJECT_ROOT/firmware"
    mkdir -p build
    cd build
    cmake ..
    make -j$(nproc)
    echo -e "${GREEN}✓ Firmware build complete${NC}"
}

main() {
    case "${1:-all}" in
        frontend)
            build_frontend
            ;;
        backend)
            build_backend
            ;;
        firmware)
            build_firmware
            ;;
        all)
            build_frontend
            build_backend
            build_firmware
            echo -e "${GREEN}=========================================="
            echo "All builds completed successfully!"
            echo "==========================================${NC}"
            ;;
        clean)
            echo -e "${YELLOW}Cleaning build artifacts...${NC}"
            rm -rf "$PROJECT_ROOT/frontend/dist"
            rm -rf "$PROJECT_ROOT/backend/dist"
            rm -rf "$PROJECT_ROOT/firmware/build"
            echo -e "${GREEN}✓ Clean complete${NC}"
            ;;
        *)
            echo "Usage: $0 {all|frontend|backend|firmware|clean}"
            exit 1
            ;;
    esac
}

main "$@"
