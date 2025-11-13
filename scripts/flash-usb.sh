#!/bin/bash
set -e

# Kiacha OS USB/SD Card Flasher
# Writes bootable image to USB drive or SD card

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}"
echo "=========================================="
echo "Kiacha OS USB/SD Card Flasher"
echo "=========================================="
echo -e "${NC}"

# Validate input
if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 /dev/sdX${NC}"
    echo ""
    echo "Find your device:"
    echo "  Linux:  lsblk"
    echo "  macOS:  diskutil list"
    echo "  Windows (WSL): lsblk"
    echo ""
    echo "Example: $0 /dev/sdb"
    exit 1
fi

DEVICE=$1
IMG="$PROJECT_ROOT/buildroot/output/images/sdcard.img"

# Validate image exists
if [ ! -f "$IMG" ]; then
    echo -e "${RED}Image not found: $IMG${NC}"
    echo ""
    echo "Build the image first:"
    echo "  cd buildroot"
    echo "  make"
    exit 1
fi

# Check if device exists
if [ ! -e "$DEVICE" ]; then
    echo -e "${RED}Device not found: $DEVICE${NC}"
    echo ""
    echo "Available devices:"
    lsblk 2>/dev/null || diskutil list
    exit 1
fi

# Safety checks
echo -e "${YELLOW}"
echo "⚠️  WARNING: This will ERASE all data on $DEVICE"
echo "Make sure it's the correct device!"
echo -e "${NC}"

# Get device info
DEVICE_SIZE=$(blockdev --getsize64 "$DEVICE" 2>/dev/null || stat -f%z "$DEVICE" 2>/dev/null || echo "unknown")
echo "Device: $DEVICE"
echo "Size: $DEVICE_SIZE bytes"
echo "Image: $IMG"
echo ""

read -p "Type 'YES' to confirm: " confirm

if [ "$confirm" != "YES" ]; then
    echo -e "${YELLOW}Cancelled${NC}"
    exit 0
fi

# Unmount device if mounted
echo -e "${YELLOW}[1/3] Unmounting device...${NC}"
if [ "$(uname)" = "Darwin" ]; then
    # macOS
    diskutil unmountDisk "$DEVICE" 2>/dev/null || true
else
    # Linux
    sudo umount "${DEVICE}"* 2>/dev/null || true
fi
echo -e "${GREEN}✓ Unmounted${NC}"

# Flash image
echo -e "${YELLOW}[2/3] Flashing image (this may take 5-10 minutes)...${NC}"
IMAGE_SIZE=$(stat -f%z "$IMG" 2>/dev/null || stat -c%s "$IMG")
echo "Image size: $((IMAGE_SIZE / 1024 / 1024)) MB"

if [ "$(uname)" = "Darwin" ]; then
    # macOS
    sudo dd if="$IMG" of="$DEVICE" bs=4m status=progress
else
    # Linux
    sudo dd if="$IMG" of="$DEVICE" bs=4M status=progress
fi

echo -e "${GREEN}✓ Flash complete${NC}"

# Sync and eject
echo -e "${YELLOW}[3/3] Syncing and ejecting...${NC}"
sync

if [ "$(uname)" = "Darwin" ]; then
    diskutil eject "$DEVICE"
else
    sudo eject "$DEVICE" 2>/dev/null || sudo umount "$DEVICE" || true
fi

echo -e "${GREEN}"
echo "=========================================="
echo "✓ Device ready to boot!"
echo "=========================================="
echo -e "${NC}"
echo ""
echo "Next steps:"
echo "  1. Safely eject the device"
echo "  2. Insert into target machine"
echo "  3. Power on and boot from USB/SD"
echo "  4. Wait for systemd to finish loading"
echo "  5. Access http://<device-ip>:3000"
echo ""
echo "To find device IP after boot:"
echo "  arp-scan -l"
echo "  nmap -p 3000 192.168.1.0/24"
echo ""
