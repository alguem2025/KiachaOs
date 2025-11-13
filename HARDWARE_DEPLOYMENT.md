# 🚀 Kiacha OS - Complete Hardware Deployment Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Development Setup](#development-setup)
3. [Building for Hardware](#building-for-hardware)
4. [Deployment Methods](#deployment-methods)
5. [First Boot](#first-boot)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Configuration](#advanced-configuration)

---

## Quick Start

### On Your Windows PC

```powershell
# 1. Clone the repository
git clone https://github.com/alguem2025/KiachaOs.git
cd KiachaOs

# 2. Setup development environment
bash scripts/setup-dev.sh

# 3. Run the system locally
make run-web

# 4. Open browser
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
```

**Time:** ~3 minutes ✅

---

## Development Setup

### Windows (PowerShell)

```powershell
# 1. Install Node.js 20+ from https://nodejs.org

# 2. Clone and navigate
git clone https://github.com/alguem2025/KiachaOs.git
cd "c:\Users\Vitorio\KiachaOs"

# 3. Install dependencies
npm install

# 4. Run frontend (dev mode with hot-reload)
cd frontend
npm run dev
# Access: http://localhost:5173

# 5. In another terminal, run backend
cd ../backend
npm run dev
# API: http://localhost:3000
```

### Linux/macOS

```bash
# Same steps but in bash
git clone https://github.com/alguem2025/KiachaOs.git
cd KiachaOs

./scripts/setup-dev.sh

make dev-frontend  # Terminal 1
make dev-backend   # Terminal 2
```

---

## Building for Hardware

### Step 1: Clone Buildroot

```bash
# On Linux/macOS (or WSL2 on Windows)
git clone git://git.buildroot.net/buildroot
cd buildroot
git checkout 2024.02
```

### Step 2: Configure for Your Target

#### **For x86_64 (PC/Laptop)**
```bash
cd "c:\Users\Vitorio\KiachaOs"
cp os-image/buildroot/configs/kiacha_defconfig buildroot/.config
cd buildroot
make menuconfig
# Verify: BR2_x86_64=y, BR2_KERNEL_LINUX_VERSION="6.9"
```

#### **For ARM64 (Raspberry Pi 4/5)**
```bash
cd buildroot
make menuconfig
# Change: BR2_x86_64=y → NO
# Change: BR2_aarch64=y → YES
# Change: BR2_aarch64_cortex_a72=y → YES
```

#### **For QEMU (Testing)**
```bash
# Use x86_64 config
make menuconfig
# Ensure virtualization support enabled
```

### Step 3: Build the Kernel and RootFS

```bash
cd buildroot

# Full build (30-60 minutes first time)
make -j$(nproc)

# Or use Makefile
cd ..
make os-build

# Check output
ls -lh buildroot/output/images/
# Should contain: Image, rootfs.cpio.gz, rootfs.ext2
```

---

## Deployment Methods

### Method 1: QEMU Emulation (Easiest - No Hardware)

**Benefits:** No hardware needed, test before deploying

```bash
cd "c:\Users\Vitorio\KiachaOs"

# Auto-builds and boots
./scripts/run-qemu.sh

# Or using Makefile
make run-qemu
```

**Inside QEMU:**
```bash
# Wait for systemd to finish loading
# Then test services
systemctl status kiacha-dashboard
curl http://localhost:3000/api/health
```

**Port forwarding:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- SSH: ssh root@localhost -p 2222

---

### Method 2: USB Flash Drive (Windows)

**Requirements:**
- USB 3.0 drive (8GB+)
- Balena Etcher (https://www.balena.io/etcher/)
- Built image: `buildroot/output/images/sdcard.img`

**Steps:**

1. **Download and install Balena Etcher**

2. **Open Balena Etcher**
   - Click "Flash from file"
   - Select `buildroot/output/images/sdcard.img`
   - Select your USB drive
   - Click "Flash"
   - Wait 5-10 minutes

3. **Eject USB and boot target machine**
   - Plug USB into target
   - Press F12/DEL/ESC during boot (varies by BIOS)
   - Select USB drive from boot menu
   - Press Enter to boot

---

### Method 3: Linux/macOS Command Line

```bash
# List devices
lsblk              # Linux
diskutil list      # macOS

# Flash image
cd "c:\Users\Vitorio\KiachaOs"
sudo ./scripts/flash-usb.sh /dev/sdX

# Replace /dev/sdX with your device!
# Be VERY careful - this will erase all data!

# Example for macOS:
# sudo ./scripts/flash-usb.sh /dev/disk2
```

---

### Method 4: Raspberry Pi SD Card

**On Linux/macOS:**

```bash
# Get SD card device
lsblk

# Flash to SD card
sudo ./scripts/flash-usb.sh /dev/sdX

# Eject
sudo eject /dev/sdX
```

**On Windows:**
1. Use Balena Etcher (see Method 2)
2. Or use Win32DiskImager from https://sourceforge.net/projects/win32diskimager/

---

## First Boot

### Physical Boot

1. **Insert media and power on**
2. **Wait for GRUB2 bootloader** (~2-3 seconds)
3. **Kernel boots** (~5-10 seconds)
4. **systemd starts services** (~10-15 seconds)
5. **All 6 services online** (~20-30 seconds total)

### Finding Your Device IP

**After boot, find the device on your network:**

```bash
# Linux/macOS
arp-scan -l

# Or use nmap
nmap -p 3000 192.168.1.0/24

# Or SSH discovery
for ip in 192.168.1.{1..254}; do
  (echo >/dev/tcp/$ip/22) &>/dev/null && echo "SSH: $ip"
done
```

### Access the Dashboard

```
http://<device-ip>:3000
```

Example:
```
http://192.168.1.100:3000
http://kiacha.local:3000  # If mDNS is available
```

### SSH into Device

```bash
ssh root@192.168.1.100
# Password: (empty by default)
```

---

## Testing Services

### Check All Services Status

```bash
# SSH into device
ssh root@192.168.1.100

# View all Kiacha services
systemctl list-units --type=service | grep kiacha

# Check specific service
systemctl status kiacha-dashboard

# View logs
journalctl -u kiacha-dashboard -f
```

### Test Each Service

```bash
# Dashboard (Frontend)
systemctl status kiacha-dashboard
curl http://localhost:3000

# Backend API
systemctl status kiacha-core
curl http://localhost:3000/api/health

# Voice processing
systemctl status kiacha-voice
journalctl -u kiacha-voice -f

# Vision/Camera
systemctl status kiacha-vision
journalctl -u kiacha-vision -f

# Hardware firmware
systemctl status kiacha-hardware
journalctl -u kiacha-hardware -f

# Network
systemctl status kiacha-network
ip a
```

---

## Troubleshooting

### Device won't boot

**Check:**
1. USB/SD is inserted correctly
2. Boot order in BIOS (F12/DEL during startup)
3. Image was flashed completely (no write errors)

**Fix:**
```bash
# Re-flash the image
./scripts/flash-usb.sh /dev/sdX
```

### Can't find device IP

**Try:**
```bash
# Scan all devices
arp-scan -l

# Check if SSH is responding
nmap -p 22 192.168.1.0/24

# Or access via hostname
ping kiacha.local

# Check router's DHCP clients
# (varies by router, check admin console)
```

### Services not starting

**SSH and check:**
```bash
ssh root@192.168.1.100

# View failed services
systemctl --failed

# View specific service error
systemctl status kiacha-dashboard
journalctl -u kiacha-dashboard -n 50

# Restart a service
systemctl restart kiacha-dashboard

# Check systemd status
systemctl status
```

### Network not working

```bash
ssh root@192.168.1.100

# Check network interface
ip a

# Check gateway
ip route

# Test DNS
nslookup google.com

# Restart network service
systemctl restart kiacha-network
```

### SSH key exchange error

```bash
# Remove old key
ssh-keygen -R 192.168.1.100

# Or from Windows
Remove-Item -Path "$env:USERPROFILE\.ssh\known_hosts" -Force
ssh root@192.168.1.100
```

---

## Advanced Configuration

### Enable SSH Key Authentication

```bash
# On your PC
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_kiacha

# Copy key to device
ssh-copy-id -i ~/.ssh/id_kiacha root@192.168.1.100

# Or manually
cat ~/.ssh/id_kiacha.pub | ssh root@192.168.1.100 \
  "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### Change Root Password

```bash
ssh root@192.168.1.100
passwd
```

### Configure Hostname

```bash
# Edit on device
ssh root@192.168.1.100
hostnamectl set-hostname my-kiacha

# Or edit config file
echo "my-kiacha" > /etc/hostname
systemctl restart systemd-hostnamed
```

### Monitor System Performance

```bash
ssh root@192.168.1.100

# CPU/Memory usage
top

# Or install htop
systemctl status
htop

# Disk usage
df -h

# Process list
ps aux | grep kiacha
```

### View Full System Logs

```bash
ssh root@192.168.1.100

# All logs
journalctl

# Last 50 lines of Kiacha logs
journalctl SYSLOG_IDENTIFIER=kiacha -n 50

# Real-time monitoring
journalctl -f

# By date
journalctl --since today
```

### Update System

```bash
ssh root@192.168.1.100

# Check for updates
curl -X GET http://localhost:3000/api/ota/check

# Or via OTA endpoint
curl -X POST http://localhost:3000/api/ota/update \
  -H "Content-Type: application/json" \
  -d '{"version": "1.1.0", "url": "https://..."}'
```

---

## Architecture Reference

```
Kiacha OS Structure:

┌─────────────────────────────────────────────────────────┐
│                  React 3D Dashboard (5173)              │
│            (VoiceWidget, VisionWidget, etc)             │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/WebSocket
┌────────────────────▼────────────────────────────────────┐
│          Fastify REST API Backend (3000)                │
│   (auth, api, memory, ota routes)                       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            AI Services & Data Processing                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  Whisper     │ │   Piper      │ │   LLaMA      │   │
│  │ (Speech-to  │ │  (Text-to    │ │ (Language    │   │
│  │  Text)      │ │   Speech)    │ │  Model)      │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ChromaDB - Vector Store (Semantic Memory)      │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│       Hardware Control Layer (C++17 Firmware)           │
│  ┌──────────┐ ┌────────┐ ┌───────┐ ┌────────┐         │
│  │  Audio   │ │Camera │ │  LED  │ │  I2C   │         │
│  │  (ALSA)  │ │(V4L2) │ │(RGB) │ │(Sensors)        │
│  └──────────┘ └────────┘ └───────┘ └────────┘         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         Linux 6.9 Kernel + systemd + Buildroot          │
│            (Minimal ~2GB rootfs)                        │
└─────────────────────────────────────────────────────────┘

Services:
  • kiacha-core         → Fastify API
  • kiacha-dashboard    → React frontend
  • kiacha-hardware     → C++17 firmware
  • kiacha-voice        → Whisper + Piper
  • kiacha-vision       → Camera/Vision
  • kiacha-network      → Networking/OTA
```

---

## Performance Specs

| Component | Specification |
|-----------|----------------|
| **OS** | Linux 6.9 + Buildroot 2024.02 |
| **RootFS** | ~2GB (minimal) |
| **Boot Time** | ~20-30 seconds |
| **Memory** | 512MB - 8GB (configurable) |
| **CPU** | x86_64, ARM64 (Cortex-A72) |
| **Dashboard** | React 18 + Three.js (5173) |
| **API** | Fastify 4.28 (3000) |
| **AI** | Whisper, Piper, LLaMA, Chroma |
| **Firmware** | C++17 with ALSA/V4L2 |

---

## Next Steps

1. **Start developing** → `make dev-frontend` + `make dev-backend`
2. **Build for hardware** → `make os-build`
3. **Test in QEMU** → `make run-qemu`
4. **Deploy to device** → `./scripts/flash-usb.sh /dev/sdX`
5. **Monitor remotely** → `ssh root@<ip>` + `journalctl -f`

---

## Support & Issues

- GitHub: https://github.com/alguem2025/KiachaOs
- Docs: Check README.md and DEVELOPMENT.md
- Issues: GitHub Issues tab
- Community: Discussions tab

---

**Kiacha OS - Build, Deploy, and Scale Your AI Operating System** 🚀
