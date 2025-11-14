# 🚀 Kiacha OS Bridge - Quick Start Card

## Installation Prerequisites

```powershell
# 1. Install Rust (one-time)
Invoke-WebRequest https://win.rustup.rs -OutFile rustup-init.exe
.\rustup-init.exe
rustup default stable

# Verify
rustc --version
cargo --version

# 2. Node.js (likely already installed)
node --version   # Should be v18+
npm --version
```

---

## 🔥 Quick Start (3 Steps)

### Step 1: Terminal 1 - Start the Kernel
```powershell
cd "c:\Users\Vitorio\Kiacha OS\kiacha-kernel"
cargo build --release
.\target\release\kiacha-kernel.exe

# OR (development, recompiles on changes)
cargo run
```

**Expected:** `✓ gRPC server listening on [::1]:50051`

---

### Step 2: Terminal 2 - Start the Brain
```powershell
cd "c:\Users\Vitorio\Kiacha OS\kiacha-brain"
npm run dev

# OR (production)
npm run build
npm start
```

**Expected:** `✓ Brain connected to kernel`

---

### Step 3: Terminal 3 - Test Communication
```bash
# REST API test
curl http://localhost:3001/api/kernel/resources

# Or use Postman: GET http://localhost:3001/api/kernel/resources

# WebSocket test (Node.js)
# See KERNEL_BRAIN_TEST.md for JavaScript example
```

**Expected Response:**
```json
{
  "cpu": 45.2,
  "memory": {
    "used": 8192000000,
    "total": 16384000000
  },
  "modules": 3,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 📊 Service Ports

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| **Kernel gRPC** | 50051 | gRPC (Binary) | Kernel API for Brain |
| **Brain REST** | 3001 | HTTP/JSON | Web API, resource stats |
| **Brain WebSocket** | 3002 | WS | Real-time event streaming |
| **Frontend Dev** | 5173 | HTTP | Vite dev server (if running) |

---

## 🛠️ Common Commands

```powershell
# Build Kernel (release)
cd kiacha-kernel
cargo build --release

# Build Kernel (debug, faster compilation)
cargo build

# Run Kernel in debug
cargo run

# Build Brain
cd kiacha-brain
npm run build

# Start Brain dev with hot reload
npm run dev

# Test Brain types
npm run build  # or: npx tsc --noEmit

# Check Rust kernel version
cargo --version
rustc --version
```

---

## 🔍 Troubleshooting

### "Connection refused" on Brain startup
```powershell
# Check if Kernel is running on 50051
Get-NetTCPConnection -LocalPort 50051 -ErrorAction SilentlyContinue

# Kill existing process (if needed)
Stop-Process -Port 50051 -Force
```

### Rust not found
```powershell
# Reinstall Rust
rustup self uninstall
Invoke-WebRequest https://win.rustup.rs -OutFile rustup-init.exe
.\rustup-init.exe
```

### Brain won't compile
```powershell
cd kiacha-brain
# Clear cache
rm -r node_modules package-lock.json
npm install
npm run build
```

### Kernel won't compile
```powershell
cd kiacha-kernel
# Update Rust
rustup update

# Clear build cache
cargo clean
cargo build --release
```

---

## 📖 Full Documentation

- **Setup & Testing**: `KERNEL_BRAIN_TEST.md`
- **Architecture**: `KIACHA_OS_SYSTEM.md`
- **Bridge Details**: `BRIDGE_COMPLETION.md`
- **GitHub**: https://github.com/alguem2025/KiachaOs

---

## ✅ Verification Checklist

After starting both services:

- [ ] Kernel running on 50051 (check with `netstat -ano | findstr 50051`)
- [ ] Brain running on 3001 and 3002
- [ ] `curl http://localhost:3001/api/kernel/resources` returns JSON
- [ ] WebSocket connection to `ws://localhost:3002` succeeds
- [ ] Brain console shows "✓ Brain connected to kernel"
- [ ] No connection errors in Kernel console

---

## 🎯 Next Steps After Verification

1. **Extend WASM Engine**
   - Edit: `frontend/wasm/hello_kiacha.cpp`
   - Build: `bash scripts/build-wasm.sh`
   - Test reasoning capabilities

2. **Implement Python Modules**
   - Edit: `kiacha-brain/modules/vision.py`
   - Edit: `kiacha-brain/modules/whisper.py`
   - Edit: `kiacha-brain/modules/piper.py`
   - Test: Call from Brain REST API

3. **Enhance Frontend**
   - Add WebGPU rendering
   - Add voice input/output
   - Add real-time module dashboard
   - Connect to Brain WebSocket

---

## 🎓 Key Architecture Points

```
Frontend (React)
    ↓ HTTP/WebSocket
Brain (Node.js/Express)
    ↓ gRPC (High-Performance Binary)
Kernel (Rust/Tokio)
    ├── Modules (Process Management)
    ├── IPC (Inter-Process Communication)
    ├── Permissions (Capability-Based Security)
    ├── Resources (CPU/Memory Monitoring)
    ├── WASM (Sandboxed Code Execution)
    └── Events (Real-Time Updates)
```

---

## 💡 Pro Tips

- **Development**: Use `cargo run` for kernel and `npm run dev` for brain (both have hot-reload)
- **Debugging**: Add `RUST_LOG=debug` before running kernel for verbose logs
- **Performance**: Use `cargo build --release` for production builds
- **Testing**: Use Postman for REST API testing, or curl from PowerShell
- **WebSocket**: Use browser DevTools → Network tab to watch WebSocket connections

---

**🎉 You're now ready to run Kiacha OS locally!**

For detailed information, see the full documentation in the repository.
