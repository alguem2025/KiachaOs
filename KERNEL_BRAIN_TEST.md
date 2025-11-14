# Kiacha Kernel ↔ Brain Communication Test Guide

## 🎯 Quick Start

### Prerequisites
1. **Rust & Cargo** (for Kernel)
   ```bash
   # Install from https://rustup.rs/
   # Or use: winget install Rustlang.Rust.MSVC
   rustup default stable
   cargo --version
   ```

2. **Node.js 18+** (for Brain)
   ```bash
   node --version  # Should be v18+
   npm --version
   ```

3. **Dependencies Already Installed**
   - ✅ Kernel dependencies: See `kiacha-kernel/Cargo.toml`
   - ✅ Brain dependencies: Run `npm install` in `kiacha-brain/`

---

## 🚀 Step 1: Start the Kernel (Port 50051)

```powershell
cd c:\Users\Vitorio\Kiacha\ OS\kiacha-kernel

# Build and run (development)
cargo run

# Or build for production, then run
cargo build --release
.\target\release\kiacha-kernel.exe
```

**Expected Output:**
```
2024-XX-XX 🧠 Kiacha Kernel starting...
2024-XX-XX ✓ gRPC server listening on [::1]:50051
2024-XX-XX ✓ Event bus initialized
```

---

## 🧠 Step 2: Start the Brain (Port 3001, 3002)

In a **new terminal**:

```powershell
cd c:\Users\Vitorio\Kiacha\ OS\kiacha-brain

# Development mode with hot reload
npm run dev

# Or production
npm run build
npm start
```

**Expected Output:**
```
🧠 Connecting to Kiacha Kernel...
✓ Brain connected to kernel
🧠 Kiacha Core Brain API listening on port 3001
🌐 WebSocket server listening on port 3002
✓ Kiacha Core Brain is running!
```

---

## ✅ Step 3: Test the Bridge

### A. REST API (Kernel Resources)

```bash
# In a third terminal
curl http://localhost:3001/api/kernel/resources

# Expected response:
# {
#   "cpu": 45.2,
#   "memory": { "used": 8192, "total": 16384 },
#   "modules": 3,
#   "timestamp": "2024-XX-XX..."
# }
```

### B. WebSocket (Real-time Kernel Events)

```javascript
// JavaScript/Node.js test
const ws = new WebSocket('ws://localhost:3002');

ws.onopen = () => {
  console.log('Connected to Brain');
  ws.send(JSON.stringify({ type: 'kernel_resources' }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log('Received:', msg);
};
```

### C. Spawn Module Test

The following endpoints will become available once modules are running:

```bash
# Check if module "vision" is running
curl http://localhost:3001/api/status

# Expected output:
# {
#   "status": "running",
#   "modules": [
#     { "name": "vision", "pid": 1234, "memory": 256, "status": "active" },
#     { "name": "audio", "pid": 1235, "memory": 128, "status": "active" }
#   ]
# }
```

---

## 🔍 Troubleshooting

### Issue: "Connection refused" on Brain startup

**Solution:**
```powershell
# 1. Check if Kernel is running
Get-NetTCPConnection -LocalPort 50051 | Select-Object State, OwningProcess

# 2. Check if Kernel port is in use
netstat -ano | findstr :50051

# 3. Kill any existing process and restart Kernel
Stop-Process -Id <PID> -Force
```

### Issue: "Cargo not found"

**Solution:**
```powershell
# Install Rust
Invoke-WebRequest https://win.rustup.rs -OutFile rustup-init.exe
.\rustup-init.exe

# Restart PowerShell and verify
rustup default stable
```

### Issue: TypeScript errors in Brain

**Solution:**
```powershell
cd c:\Users\Vitorio\Kiacha\ OS\kiacha-brain
npm install  # Re-install dependencies
npm run build  # Check for type errors
```

---

## 🎨 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React/Three.js)                 │
│                    Port 5173 (Vite dev)                     │
└────────┬──────────────────────────────────────┬─────────────┘
         │ HTTP/WebSocket                       │
         │                                      │
┌────────▼──────────────────────────────────────▼─────────────┐
│            Brain (Node.js + Express + WebSocket)             │
│                  Port 3001 (REST)                           │
│                  Port 3002 (WebSocket)                      │
└────────┬──────────────────────────────────────────────────┬──┘
         │ gRPC (Binary, High-Perf)                        │
         │ Async/Await via @grpc/grpc-js                   │
         │                                                 │
┌────────▼─────────────────────────────────────────────────▼──┐
│           Kernel (Rust + Tokio + Tonic gRPC)                │
│                   Port 50051 (gRPC)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Module Mgr  │  │  Permission  │  │ WASM Runtime │      │
│  │              │  │    System    │  │  (Wasmtime)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  IPC System  │  │ Event Bus    │  │  Security    │      │
│  │              │  │  (Broadcast) │  │   Audit      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────┬──────────────────────────────────────────────────┬──┘
         │                                                  │
    ┌────▼─────┐                                    ┌──────▼──────┐
    │ OS Calls  │                                   │   Python    │
    │ sysinfo   │                                   │  Modules    │
    └───────────┘                                   └─────────────┘
```

---

## 📊 Expected Communication Flow

### 1. Brain Connects to Kernel (On Startup)

```
Brain (connect)
  ↓
Create gRPC Channel to [::1]:50051
  ↓
Send first RPC: GetResources()
  ↓
Kernel responds with CPU/Memory/Module stats
  ↓
Brain subscribes to kernel Event Bus
  ↓
✓ Connection established
```

### 2. Real-time Event Subscription

```
Kernel Event Bus
  ↓ (broadcasts)
event_type: "module_spawned"
  ↓
Brain event-bus.ts receives event
  ↓
Brain emits to all WebSocket clients
  ↓
Frontend receives real-time updates
```

### 3. Module Spawning (Future)

```
Frontend: POST /api/modules/spawn { name: "vision" }
  ↓
Brain gRPC: kernel_client.spawnModule({ name: "vision" })
  ↓
Kernel: Creates new process, assigns PID, tracks permissions
  ↓
Kernel: Broadcasts event "module_spawned"
  ↓
Brain: Receives event, updates local cache
  ↓
Frontend: Sees "vision module running" in dashboard
```

---

## 🛠️ Next Steps After Testing

1. **✅ Verify Kernel ↔ Brain gRPC Bridge Works**
   - Run both services
   - Test REST API `/api/kernel/resources`
   - Verify WebSocket events flow

2. **Extend WASM Reasoning Engine**
   - Add chain-of-thought logic to `frontend/wasm/hello_kiacha.cpp`
   - Rebuild with Emscripten: `bash scripts/build-wasm.sh`
   - Test reasoning performance

3. **Implement Python AI Modules**
   - Complete `kiacha-brain/modules/vision.py` (YOLOv8, depth estimation)
   - Complete `kiacha-brain/modules/whisper.py` (ASR)
   - Complete `kiacha-brain/modules/piper.py` (TTS)
   - Test inference via Brain REST API

4. **Frontend Multimodal UI**
   - Add WebGPU rendering to Dashboard3D.tsx
   - Add voice input with useWhisper hook
   - Add camera feed integration
   - Real-time module status visualization

---

## 🔗 Key Files

| Component | Language | Path | Purpose |
|-----------|----------|------|---------|
| **Kernel** | Rust | `kiacha-kernel/src/main.rs` | gRPC server entry point |
| **Kernel Core** | Rust | `kiacha-kernel/src/kernel.rs` | Module lifecycle, permissions |
| **Kernel IPC** | Rust | `kiacha-kernel/src/ipc.rs` | Inter-process communication |
| **Kernel Events** | Rust | `kiacha-kernel/src/event_bus.rs` | Event broadcast system |
| **Kernel gRPC** | Rust | `kiacha-kernel/src/grpc_server.rs` | tonic RPC service |
| **Proto Schema** | Protobuf | `shared/proto/kiacha.proto` | Interface definitions |
| **Brain Core** | TypeScript | `kiacha-brain/src/core-brain.ts` | Orchestrator with kernel conn |
| **Brain gRPC** | TypeScript | `kiacha-brain/src/grpc-client.ts` | Kernel client library |
| **Brain Events** | TypeScript | `kiacha-brain/src/event-bus.ts` | Event subscription handler |
| **Brain API** | TypeScript | `kiacha-brain/src/index.ts` | Express REST + WebSocket |

---

## 📝 Environment Variables

```bash
# In kiacha-brain/.env (optional)
KERNEL_ADDRESS=localhost:50051  # Default if not set
LOG_LEVEL=debug
NODE_ENV=development
```

---

## 🎓 Learning Resources

- **gRPC Basics**: https://grpc.io/docs/what-is-grpc/
- **Tokio Async Runtime**: https://tokio.rs/
- **Tonic Framework**: https://github.com/hyperium/tonic
- **Protobuf**: https://developers.google.com/protocol-buffers
- **Event-Driven Architecture**: https://www.eventdriven.io/

---

**🎉 Once both services run together with successful gRPC communication, your Kiacha OS will be operational!**
