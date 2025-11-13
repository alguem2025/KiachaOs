# 🎯 Kiacha OS - Quick Build Reference

## For Windows Users (Your Environment)

```powershell
# Navigate to project
cd "c:\Users\Vitorio\Kiacha OS"

# ============================================
# DEVELOPMENT (No hardware needed)
# ============================================

# 1. Install dependencies (first time only)
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 2. Run development environment
make run-web

# OR run individual services:
npm run dev                  # Frontend (port 5173)
cd backend && npm run dev    # Backend (port 3000)

# ============================================
# BUILD FOR PRODUCTION
# ============================================

# Build all components
make build-all

# OR individual builds:
make build-frontend
make build-backend
make build-firmware

# ============================================
# HARDWARE DEPLOYMENT
# ============================================

# Option 1: Test in QEMU (no real hardware)
make run-qemu
# Access: http://localhost:3000

# Option 2: Build OS for real hardware
# Install Buildroot first (on Linux/WSL)
cd buildroot
make
# Takes 30-60 minutes

# Option 3: Flash to USB (after OS built)
./scripts/flash-usb.sh /dev/sdX    # Linux/Mac
# Or use Balena Etcher on Windows

# ============================================
# TROUBLESHOOTING
# ============================================

# Clean all builds
make clean

# Deep clean (remove node_modules)
make clean-all

# View available commands
make help

# Check system status in QEMU/Hardware
ssh root@192.168.1.100
systemctl status kiacha-dashboard
journalctl -u kiacha-dashboard -f
```

---

## File Structure Reference

```
c:\Users\Vitorio\Kiacha OS\
├── frontend/              # React 18 + Three.js (npm install, npm run dev)
├── backend/               # Fastify API (npm run dev)
├── firmware/              # C++17 (cmake build)
├── os-image/              # Linux build (Buildroot)
├── scripts/
│   ├── build.sh          # Multi-component builder
│   ├── setup-dev.sh      # Dev environment setup
│   ├── run-qemu.sh       # QEMU emulator
│   └── flash-usb.sh      # USB/SD flasher
├── Makefile              # Main build system
└── HARDWARE_DEPLOYMENT.md # Full hardware guide
```

---

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (Fastify) | 3000 | http://localhost:3000 |
| API Health | 3000 | http://localhost:3000/api/health |
| Dashboard | 3000 | http://localhost:3000 |
| SSH (QEMU) | 2222 | ssh root@localhost -p 2222 |

---

## First Time Setup

```powershell
# 1. Clone repository
git clone https://github.com/alguem2025/KiachaOs.git
cd "c:\Users\Vitorio\KiachaOs"

# 2. Install Node.js 20+
# From: https://nodejs.org

# 3. Install project dependencies
npm install

# 4. Run complete setup
bash scripts/setup-dev.sh

# 5. Start development
make run-web

# Access: http://localhost:3000
```

---

## Common Tasks

```bash
# Start only frontend
cd frontend && npm run dev

# Start only backend
cd backend && npm run dev

# Build only
npm run build

# Test build output
npm run preview   # Frontend

# Format code
npm run format

# Lint check
npm run lint
```

---

## System Requirements

- **Node.js**: 20+ (https://nodejs.org)
- **npm**: 10+
- **Git**: 2.30+
- **For Hardware Build**: Linux/WSL with Buildroot dependencies
- **For QEMU**: QEMU installed (`brew install qemu` or `apt-get install qemu-system`)
- **For USB Flash**: Linux, macOS, or Windows with Balena Etcher

---

## Platform Support

| Platform | Support | Method |
|----------|---------|--------|
| Windows PC | ✅ | make run-web |
| macOS | ✅ | make run-web |
| Linux | ✅ | make run-web |
| QEMU (any) | ✅ | make run-qemu |
| Raspberry Pi 4/5 | ✅ | Flash compiled image |
| x86_64 Hardware | ✅ | Flash compiled image |
| Orange Pi | ✅ | Modify config |
| Docker | ✅ | docker-compose up |

---

## Help & Support

```bash
# View all available commands
make help

# Check setup
bash scripts/setup-dev.sh

# View Makefile targets
grep "^[a-z].*:" Makefile | head -20

# Check Node.js version
node --version
npm --version

# Update npm
npm install -g npm@latest
```

---

## Environment Variables

```bash
# Optional configuration
export NODE_ENV=production
export VITE_API_URL=http://localhost:3000
export FASTIFY_PORT=3000
export LOG_LEVEL=debug
```

---

## Docker Commands (Alternative)

```bash
# Build Docker images
docker build -t kiacha-frontend ./frontend
docker build -t kiacha-backend ./backend

# Run with Docker Compose
docker-compose up

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

---

## Git Commands

```powershell
# After making changes
git add .
git commit -m "Your message"
git push origin main

# View commits
git log --oneline

# Create new branch
git checkout -b feature/my-feature

# Push branch
git push origin feature/my-feature
```

---

## Performance Optimization

```bash
# Frontend optimization
npm run build          # Builds optimized dist/

# Backend optimization
npm run build          # Compiles TypeScript
npm prune             # Remove dev dependencies

# Check bundle size
npm run analyze       # (if available)
```

---

## Security Notes

- ✅ Change root password after first boot: `passwd`
- ✅ Use SSH keys: `ssh-copy-id -i ~/.ssh/id_rsa root@192.168.1.100`
- ✅ Use VPN for remote access
- ✅ Keep system updated: `make os-build` (rebuilds with latest)
- ✅ Rotate JWT secrets regularly
- ✅ Use HTTPS in production

---

## Monitoring

```bash
# SSH into device
ssh root@192.168.1.100

# View system status
top
df -h
ps aux | grep kiacha

# View logs
journalctl -u kiacha-dashboard -f

# Check network
ip a
netstat -tlnp
```

---

## Useful Links

- 📖 [Full Documentation](./HARDWARE_DEPLOYMENT.md)
- 🐙 [GitHub Repository](https://github.com/alguem2025/KiachaOs)
- 🔧 [Development Guide](./DEVELOPMENT.md)
- 📊 [Project Status](./PROJECT_STATUS.md)
- 🚀 [Getting Started](./START.txt)

---

## Version Info

- **Kiacha OS**: 1.0.0
- **Frontend**: React 18.3 + Three.js 6.0
- **Backend**: Fastify 4.28
- **Firmware**: C++17
- **OS**: Linux 6.9 + Buildroot 2024.02
- **Build Date**: November 13, 2025

---

**Last Updated**: November 13, 2025 ✅

For detailed hardware deployment instructions, see `HARDWARE_DEPLOYMENT.md`
