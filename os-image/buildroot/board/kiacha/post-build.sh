#!/bin/bash
set -e

# Kiacha OS Post-Build Script
# Runs after Buildroot builds the rootfs
# Sets up systemd services and configuration

BOARD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-.}"

echo "=================================="
echo "Kiacha OS Post-Build Setup"
echo "=================================="

# Create necessary directories
echo "[1/5] Creating directories..."
mkdir -p ${TARGET_DIR}/etc/systemd/system
mkdir -p ${TARGET_DIR}/etc/systemd/system/multi-user.target.wants
mkdir -p ${TARGET_DIR}/etc/kiacha
mkdir -p ${TARGET_DIR}/opt/kiacha/bin
mkdir -p ${TARGET_DIR}/var/log/kiacha
mkdir -p ${TARGET_DIR}/root/.ssh

# Copy systemd services
echo "[2/5] Installing systemd services..."
if [ -d "${BOARD_DIR}/../../../overlay/etc/systemd/system" ]; then
    cp -r "${BOARD_DIR}/../../../overlay/etc/systemd/system"/* ${TARGET_DIR}/etc/systemd/system/
else
    echo "Warning: systemd services directory not found"
fi

# Copy configuration files
echo "[3/5] Copying configuration files..."
if [ -f "${BOARD_DIR}/../../../overlay/etc/kiacha/config.json" ]; then
    cp "${BOARD_DIR}/../../../overlay/etc/kiacha/config.json" ${TARGET_DIR}/etc/kiacha/
fi

# Enable Kiacha services in systemd
echo "[4/5] Enabling systemd services..."
for service in kiacha-core.service kiacha-dashboard.service kiacha-hardware.service \
               kiacha-voice.service kiacha-vision.service kiacha-network.service; do
    if [ -f "${TARGET_DIR}/etc/systemd/system/$service" ]; then
        mkdir -p ${TARGET_DIR}/etc/systemd/system/multi-user.target.wants/
        ln -sf "../$service" ${TARGET_DIR}/etc/systemd/system/multi-user.target.wants/$service || true
    fi
done

# Create root SSH directory
echo "[5/5] Finalizing..."
chmod 700 ${TARGET_DIR}/root/.ssh || true
chmod 600 ${TARGET_DIR}/root/.ssh/authorized_keys 2>/dev/null || true

# Set permissions
chmod 755 ${TARGET_DIR}/opt/kiacha/bin
chmod 755 ${TARGET_DIR}/var/log/kiacha

# Create welcome message
cat > ${TARGET_DIR}/etc/issue << 'EOF'

  ██╗  ██╗██╗ █████╗  ██████╗██╗  ██╗ █████╗ 
  ██║ ██╔╝██║██╔══██╗██╔════╝██║  ██║██╔══██╗
  █████╔╝ ██║███████║██║     ███████║███████║
  ██╔═██╗ ██║██╔══██║██║     ██╔══██║██╔══██║
  ██║  ██╗██║██║  ██║╚██████╗██║  ██║██║  ██║
  ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝

  Kiacha OS - AI Operating System
  Kernel: Linux 6.9
  Web Dashboard: http://<ip>:3000
  SSH: ssh root@<ip>

EOF

echo "✅ Post-build completed successfully"
echo ""
echo "Services enabled:"
echo "  • kiacha-core         (Fastify API backend)"
echo "  • kiacha-dashboard    (React frontend)"
echo "  • kiacha-hardware     (C++17 firmware)"
echo "  • kiacha-voice        (Whisper/Piper AI)"
echo "  • kiacha-vision       (Camera/vision processing)"
echo "  • kiacha-network      (Networking)"
echo ""
