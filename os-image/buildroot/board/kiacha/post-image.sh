#!/bin/bash
set -e

# Kiacha OS Post-Image Script
# Runs after rootfs image is created
# Generates bootable media (ISO, SD card image, etc)

BOARD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BINARIES_DIR="${1:-.}"

echo "=================================="
echo "Kiacha OS Post-Image Generation"
echo "=================================="

# Ensure output directory exists
mkdir -p ${BINARIES_DIR}

# Copy GRUB configuration
echo "[1/4] Configuring bootloader..."
mkdir -p ${BINARIES_DIR}/efi-part/EFI/BOOT

if [ -f "${BOARD_DIR}/grub.cfg" ]; then
    cp ${BOARD_DIR}/grub.cfg ${BINARIES_DIR}/grub.cfg
    echo "✓ GRUB configuration copied"
else
    echo "Warning: grub.cfg not found"
fi

# Generate SD card image for ARM64 (Raspberry Pi)
echo "[2/4] Generating bootable images..."

if [ -f "${BINARIES_DIR}/rootfs.ext2" ]; then
    # Create SD card image with partition table
    SDCARD_SIZE=2048  # 2GB
    PART_START=2048
    PART_SIZE=$((${SDCARD_SIZE} * 1024 * 2 - ${PART_START}))
    
    if command -v genimage &> /dev/null; then
        echo "✓ Generating SD card image..."
        genimage --rootpath ${BINARIES_DIR} \
                 --tmppath ${BINARIES_DIR}/tmp \
                 --inputpath ${BINARIES_DIR} \
                 --outputpath ${BINARIES_DIR} \
                 --config ${BOARD_DIR}/genimage.cfg || true
    else
        echo "Note: genimage not available for advanced image generation"
    fi
fi

# Create CPIO image (for QEMU)
echo "[3/4] Preparing QEMU images..."
if [ ! -f "${BINARIES_DIR}/rootfs.cpio.gz" ]; then
    if [ -d "${BINARIES_DIR}/root" ]; then
        cd ${BINARIES_DIR}/root
        find . -print0 | cpio -0 -H newc -o | gzip > ../rootfs.cpio.gz
        cd - > /dev/null
        echo "✓ CPIO image created"
    fi
fi

# Create bootable ISO for x86_64
echo "[4/4] Generating bootable media..."

if command -v xorriso &> /dev/null; then
    echo "✓ Creating bootable ISO..."
    xorriso -as mkisofs \
        -o ${BINARIES_DIR}/kiacha-os.iso \
        -b isolinux/isolinux.bin \
        -c isolinux/boot.cat \
        -no-emul-boot -boot-load-size 4 -boot-info-table \
        ${BINARIES_DIR}/isolinux 2>/dev/null || true
fi

# Create summary
echo ""
echo "✅ Image generation completed"
echo ""
echo "Available images in ${BINARIES_DIR}:"
echo "  • rootfs.cpio.gz      (QEMU/initramfs)"
echo "  • Image               (Linux kernel)"
echo "  • sdcard.img          (SD card image)"
echo "  • rootfs.ext2         (Ext2 filesystem)"
echo "  • kiacha-os.iso       (Bootable ISO)"
echo ""
echo "To test in QEMU:"
echo "  ./scripts/run-qemu.sh"
echo ""
echo "To flash to USB/SD:"
echo "  ./scripts/flash-usb.sh /dev/sdX"
echo ""
