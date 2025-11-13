#!/bin/bash
set -e

# Kiacha OS QEMU Runner
# Boots the system in QEMU emulator with full support for x86_64 and ARM64

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "=========================================="
echo "Kiacha OS QEMU Emulator"
echo "=========================================="
echo -e "${NC}"

# Check QEMU installation
check_qemu() {
    if command -v qemu-system-x86_64 &> /dev/null; then
        echo -e "${GREEN}✓ QEMU x86_64 found${NC}"
        return 0
    elif command -v qemu-system-aarch64 &> /dev/null; then
        echo -e "${GREEN}✓ QEMU ARM64 found${NC}"
        return 0
    else
        echo -e "${RED}QEMU not found. Install with:${NC}"
        echo "  Ubuntu: sudo apt-get install qemu-system"
        echo "  macOS: brew install qemu"
        echo "  Windows: https://www.qemu.org/download/"
        return 1
    fi
}

# Detect architecture
detect_arch() {
    if command -v qemu-system-aarch64 &> /dev/null; then
        echo "aarch64"
    else
        echo "x86_64"
    fi
}

# Build kernel and rootfs if not present
ensure_images() {
    if [ ! -f "$PROJECT_ROOT/buildroot/output/images/Image" ] || [ ! -f "$PROJECT_ROOT/buildroot/output/images/rootfs.cpio.gz" ]; then
        echo -e "${YELLOW}Building Buildroot images (this may take 30-60 minutes)...${NC}"
        cd "$PROJECT_ROOT/buildroot"
        make -j$(nproc)
        echo -e "${GREEN}✓ Build complete${NC}"
    fi
}

# Run QEMU emulation
run_qemu() {
    local ARCH=$1
    local KERNEL="$PROJECT_ROOT/buildroot/output/images/Image"
    local ROOTFS="$PROJECT_ROOT/buildroot/output/images/rootfs.cpio.gz"

    echo -e "${GREEN}Starting QEMU...${NC}"
    echo "Architecture: $ARCH"
    echo "Memory: 2GB"
    echo "Cores: $(nproc)"
    echo ""
    echo "Port forwarding:"
    echo "  Backend API:  http://localhost:3000"
    echo "  Frontend:     http://localhost:5173"
    echo "  SSH:          localhost:2222"
    echo ""
    echo -e "${YELLOW}Ctrl+C to exit${NC}"
    sleep 2

    if [ "$ARCH" = "aarch64" ]; then
        # ARM64 boot (Raspberry Pi compatible)
        qemu-system-aarch64 \
            -machine virt \
            -cpu cortex-a72 \
            -m 2G \
            -smp $(nproc) \
            -kernel "$KERNEL" \
            -initrd "$ROOTFS" \
            -append "root=/dev/ram0 rw console=ttyAMA0 earlycon=pl011,0x9000000 systemd.log_target=journal" \
            -serial stdio \
            -netdev user,id=net0,hostfwd=tcp::3000-:3000,hostfwd=tcp::5173-:5173,hostfwd=tcp::2222-:22 \
            -device virtio-net-device,netdev=net0 \
            -nographic 2>&1 || true
    else
        # x86_64 boot
        if command -v qemu-system-x86_64 &> /dev/null; then
            qemu-system-x86_64 \
                -machine pc \
                -m 2G \
                -smp $(nproc) \
                -kernel "$KERNEL" \
                -initrd "$ROOTFS" \
                -append "root=/dev/ram0 rw console=ttyS0 quiet systemd.log_target=journal" \
                -serial stdio \
                -netdev user,id=net0,hostfwd=tcp::3000-:3000,hostfwd=tcp::5173-:5173,hostfwd=tcp::2222-:22 \
                -device e1000,netdev=net0 \
                -enable-kvm \
                -nographic 2>&1 || \
            qemu-system-x86_64 \
                -machine pc \
                -m 2G \
                -smp $(nproc) \
                -kernel "$KERNEL" \
                -initrd "$ROOTFS" \
                -append "root=/dev/ram0 rw console=ttyS0 quiet systemd.log_target=journal" \
                -serial stdio \
                -netdev user,id=net0,hostfwd=tcp::3000-:3000,hostfwd=tcp::5173-:5173,hostfwd=tcp::2222-:22 \
                -device e1000,netdev=net0 \
                -nographic
        fi
    fi
}

main() {
    check_qemu || exit 1
    ensure_images
    local ARCH=$(detect_arch)
    run_qemu "$ARCH"
}

main "$@"
