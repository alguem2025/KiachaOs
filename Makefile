.PHONY: all help setup build-all build-frontend build-backend build-firmware firmware-build os-build image-build run-web run-qemu flash clean qemu-boot test-services

# Kiacha OS Makefile
# Full-stack build and deployment system

PROJECT_ROOT := $(shell pwd)
FRONTEND_DIR := $(PROJECT_ROOT)/frontend
BACKEND_DIR := $(PROJECT_ROOT)/backend
FIRMWARE_DIR := $(PROJECT_ROOT)/firmware
OS_DIR := $(PROJECT_ROOT)/os-image
BUILDROOT_DIR := $(PROJECT_ROOT)/buildroot
SCRIPTS_DIR := $(PROJECT_ROOT)/scripts

# Colors
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Default target
all: help

help:
	@echo "$(BLUE)"
	@echo "=========================================="
	@echo "Kiacha OS - Build & Deployment System"
	@echo "=========================================="
	@echo "$(NC)"
	@echo ""
	@echo "$(YELLOW)Setup & Development:$(NC)"
	@echo "  make setup          - Install all dependencies"
	@echo "  make run-web        - Run frontend + backend (Docker Compose)"
	@echo "  make dev-frontend   - Dev mode: frontend only"
	@echo "  make dev-backend    - Dev mode: backend only"
	@echo ""
	@echo "$(YELLOW)Building:$(NC)"
	@echo "  make build-all      - Build frontend, backend, firmware"
	@echo "  make build-frontend - Build React + Three.js frontend"
	@echo "  make build-backend  - Build Fastify API backend"
	@echo "  make build-firmware - Build C++17 embedded firmware"
	@echo "  make firmware-build - Alias: build firmware"
	@echo "  make os-build       - Build Linux OS (Buildroot)"
	@echo "  make image-build    - Generate bootable image"
	@echo ""
	@echo "$(YELLOW)Emulation & Testing:$(NC)"
	@echo "  make qemu-boot      - Boot system in QEMU"
	@echo "  make run-qemu       - Alias: boot in QEMU"
	@echo "  make test-services  - Test all systemd services"
	@echo ""
	@echo "$(YELLOW)Deployment:$(NC)"
	@echo "  make flash DEV=/dev/sdX - Flash to USB/SD card"
	@echo ""
	@echo "$(YELLOW)Cleanup:$(NC)"
	@echo "  make clean          - Remove all build artifacts"
	@echo "  make clean-all      - Deep clean (including node_modules)"
	@echo ""

# Setup development environment
setup:
	@echo "$(YELLOW)Setting up development environment...$(NC)"
	@bash $(SCRIPTS_DIR)/setup-dev.sh
	@echo "$(GREEN)✓ Setup complete$(NC)"

# Development mode
dev-frontend:
	@echo "$(YELLOW)Starting Frontend development server...$(NC)"
	cd $(FRONTEND_DIR) && npm run dev

dev-backend:
	@echo "$(YELLOW)Starting Backend development server...$(NC)"
	cd $(BACKEND_DIR) && npm run dev

# Build individual components
build-frontend:
	@echo "$(YELLOW)[1/3] Building Frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm install --production && npm run build
	@echo "$(GREEN)✓ Frontend built$(NC)"

build-backend:
	@echo "$(YELLOW)[2/3] Building Backend...$(NC)"
	cd $(BACKEND_DIR) && npm install --production && npm run build
	@echo "$(GREEN)✓ Backend built$(NC)"

build-firmware:
	@echo "$(YELLOW)[3/3] Building Firmware...$(NC)"
	@if [ ! -d "$(FIRMWARE_DIR)/build" ]; then mkdir -p $(FIRMWARE_DIR)/build; fi
	cd $(FIRMWARE_DIR)/build && cmake .. && make -j$$(nproc)
	@echo "$(GREEN)✓ Firmware built$(NC)"

# Aliases
firmware-build: build-firmware

# Build all components
build-all: build-frontend build-backend build-firmware
	@echo ""
	@echo "$(GREEN)=========================================="
	@echo "All components built successfully!"
	@echo "==========================================$(NC)"

# OS and image building
os-build:
	@echo "$(YELLOW)Building Linux OS (Buildroot)...$(NC)"
	@echo "This may take 30-60 minutes on first run"
	@echo ""
	cd $(BUILDROOT_DIR) && make -j$$(nproc)
	@echo "$(GREEN)✓ OS built$(NC)"

image-build: os-build
	@echo "$(YELLOW)Generating bootable image...$(NC)"
	@if [ -f "$(BUILDROOT_DIR)/output/images/Image" ]; then \
		echo "$(GREEN)✓ Kernel ready: $(BUILDROOT_DIR)/output/images/Image$(NC)"; \
	fi
	@if [ -f "$(BUILDROOT_DIR)/output/images/rootfs.cpio.gz" ]; then \
		echo "$(GREEN)✓ RootFS ready: $(BUILDROOT_DIR)/output/images/rootfs.cpio.gz$(NC)"; \
	fi

# Run with Docker Compose
run-web:
	@echo "$(YELLOW)Starting Kiacha OS development environment...$(NC)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:3000"
	@echo ""
	docker-compose up --build -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "Run 'docker-compose logs -f' to view logs"

# QEMU emulation
qemu-boot: image-build
	@echo "$(YELLOW)Booting in QEMU...$(NC)"
	@bash $(SCRIPTS_DIR)/run-qemu.sh

run-qemu: qemu-boot

# WASM & WSL helpers
build-wasm:
	@echo "$(YELLOW)Building Hello Kiacha WASM...$(NC)"
	@if command -v bash >/dev/null 2>&1; then \
		bash -lc 'bash "$(SCRIPTS_DIR)/build-wasm.sh"'; \
	else \
		echo "Please run: bash scripts/build-wasm.sh (WSL or bash required)"; exit 1; \
	fi

.PHONY: wsl wsl-buildroot
# Print helpful WSL commands to run Buildroot and WASM builds
wsl:
	@echo "$(YELLOW)WSL Helper - copy & run these commands in Ubuntu/WSL$(NC)"
	@echo ""
	@echo "cd /mnt/c/Users/Vitorio/\"Kiacha OS\""
	@echo "# Build WASM (after installing emsdk):"
	@echo "bash scripts/build-wasm.sh"
	@echo ""
	@echo "# Build Buildroot (first copy defconfig):"
	@echo "cp os-image/buildroot/configs/kiacha_defconfig buildroot/.config"
	@echo "cd buildroot && make -j\$$(nproc)"

wsl-buildroot:
	@echo "$(YELLOW)Running Buildroot in WSL (must be in WSL shell)$(NC)"
	@echo "Make sure you have required packages: gcc, make, binutils, rsync, cpio, python3"
	@cd $(BUILDROOT_DIR) && make -j$$(nproc)

# Test services
test-services:
	@echo "$(BLUE)Testing Kiacha OS Services$(NC)"
	@echo ""
	@echo "To test services, SSH into running instance:"
	@echo "  ssh root@localhost -p 2222"
	@echo ""
	@echo "Then run:"
	@echo "  systemctl status kiacha-dashboard"
	@echo "  systemctl status kiacha-core"
	@echo "  systemctl status kiacha-voice"
	@echo "  systemctl status kiacha-vision"
	@echo "  systemctl list-units --type=service | grep kiacha"
	@echo "  journalctl -u kiacha-dashboard -f"
	@echo ""

# Flash to USB/SD
flash:
	@if [ -z "$(DEV)" ]; then \
		echo "$(YELLOW)Usage: make flash DEV=/dev/sdX$(NC)"; \
		echo ""; \
		echo "Find your device:"; \
		echo "  Linux:  lsblk"; \
		echo "  macOS:  diskutil list"; \
		exit 1; \
	fi
	@bash $(SCRIPTS_DIR)/flash-usb.sh $(DEV)

# Cleanup
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf $(FRONTEND_DIR)/dist
	rm -rf $(BACKEND_DIR)/dist
	rm -rf $(FIRMWARE_DIR)/build
	rm -rf $(BUILDROOT_DIR)/output
	@echo "$(GREEN)✓ Clean complete$(NC)"

clean-all: clean
	@echo "$(YELLOW)Deep clean (removing node_modules)...$(NC)"
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(BACKEND_DIR)/node_modules
	@echo "$(GREEN)✓ Deep clean complete$(NC)"

# Docker commands
docker-build:
	@echo "$(YELLOW)Building Docker images...$(NC)"
	docker build -t kiacha-frontend ./frontend
	docker build -t kiacha-backend ./backend
	@echo "$(GREEN)✓ Docker images built$(NC)"

docker-push:
	@echo "$(YELLOW)Pushing Docker images to registry...$(NC)"
	docker push kiacha-frontend
	docker push kiacha-backend
	@echo "$(GREEN)✓ Images pushed$(NC)"

# Version info
version:
	@echo "Kiacha OS Build System"
	@echo "Frontend: React 18 + Three.js"
	@echo "Backend:  Fastify 4.28 + Node.js"
	@echo "Firmware: C++17 + CMake 3.20"
	@echo "OS:       Linux 6.9 + Buildroot 2024.02"
