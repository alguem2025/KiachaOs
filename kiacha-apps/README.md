# 🏛️ Kiacha OS Native Apps Package

Complete suite of native applications for Kiacha OS, built with React, Node.js, and Rust.

## 📦 Apps Included

### 1. 🎛️ Kiacha Control Center (Settings)
**Windows Settings equivalent with intelligent modules**

Features:
- System configuration
- Device management
- Personalization (themes, language, accessibility)
- Voice/Camera/AI settings
- Storage management
- Kernel module configuration
- WASM execution policies
- Update channels

**Endpoints:**
- `GET /api/settings/system` - System information
- `GET /api/settings/devices` - Connected devices
- `POST /api/settings/update` - Update settings
- `GET /api/settings/modules` - Module settings
- `POST /api/settings/personalization` - Theme, language

**gRPC Methods:**
- `GetSystemInfo()` - CPU cores, memory, kernel version
- `GetDeviceList()` - Connected peripherals
- `UpdateModulePolicy()` - WASM/module execution policies
- `GetLocalization()` - Language and locale settings

---

### 2. 📂 Kiacha Explorer (File Manager)
**File browser with storage monitoring**

Features:
- File navigation and management (copy, move, delete)
- Real-time storage monitoring
- Module/WASM sandbox access
- Disk space analytics
- Quick access shortcuts
- Search functionality

**Endpoints:**
- `GET /api/explorer/list` - Directory listing
- `POST /api/explorer/copy` - Copy files
- `POST /api/explorer/move` - Move files
- `DELETE /api/explorer/delete` - Delete files
- `GET /api/explorer/storage` - Storage analytics
- `GET /api/explorer/sandbox` - Sandbox contents

**gRPC Methods:**
- `FsList(path)` - List directory
- `FsGetInfo(path)` - File metadata
- `FsCopy(src, dst)` - Copy operation
- `FsDelete(path)` - Delete file/directory
- `GetStorageStats()` - Disk space info

---

### 3. 📊 Kiacha Monitor (Task Manager)
**Process monitoring with AI metrics**

Features:
- Real-time CPU, RAM, IO monitoring
- Process management (kill, pause, resume)
- WASM thread monitoring
- Kernel module metrics
- Performance graphs
- Resource priority adjustment
- Alert thresholds

**Endpoints:**
- `GET /api/monitor/processes` - Active processes
- `GET /api/monitor/stats` - CPU/memory/IO stats
- `POST /api/monitor/kill` - Terminate process
- `POST /api/monitor/pause` - Pause module
- `POST /api/monitor/resume` - Resume module
- `GET /api/monitor/performance` - Historical data
- `POST /api/monitor/priority` - Set process priority

**gRPC Methods:**
- `ListProcesses()` - All processes with stats
- `GetProcessInfo(pid)` - Detailed process info
- `KillProcess(pid)` - Terminate process
- `PauseModule(name)` - Pause kernel module
- `ResumeModule(name)` - Resume kernel module
- `GetResourceStats()` - Real-time metrics

---

### 4. 🌐 Kiacha Network (Network Settings)
**Network management and firewall**

Features:
- Wi-Fi/Ethernet configuration
- Network priority management
- Module-level firewall rules
- Traffic monitoring and logs
- VPN support
- Network optimization
- Bandwidth limiting

**Endpoints:**
- `GET /api/network/status` - Connection status
- `GET /api/network/interfaces` - Network adapters
- `POST /api/network/connect` - Connect to network
- `GET /api/network/firewall` - Firewall rules
- `POST /api/network/firewall/rule` - Add rule
- `DELETE /api/network/firewall/rule` - Remove rule
- `GET /api/network/traffic` - Traffic logs
- `POST /api/network/bandwidth/limit` - Set limit

**gRPC Methods:**
- `GetNetworkStatus()` - Connection info
- `ListNetworks()` - Available networks
- `ConnectNetwork(ssid, password)` - Connect
- `GetFirewallRules()` - All rules
- `AddFirewallRule(rule)` - Create rule
- `RemoveFirewallRule(id)` - Delete rule
- `GetTrafficStats()` - Traffic analysis

---

### 5. 👤 Kiacha Users (User Management)
**User accounts and permissions**

Features:
- User account creation/deletion
- Role-based access control (RBAC)
- App permission management
- Biometric authentication (Vision Module)
- SSO local support
- Session management
- Activity logging

**Endpoints:**
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/permissions` - Grant permissions
- `DELETE /api/users/:id/permissions/:app` - Revoke permission
- `GET /api/users/:id/apps` - User's accessible apps
- `POST /api/auth/biometric` - Biometric login
- `GET /api/users/:id/sessions` - Active sessions

**gRPC Methods:**
- `ListUsers()` - All users
- `CreateUser(name, role)` - New user
- `DeleteUser(uid)` - Remove user
- `GetUserPermissions(uid)` - User's ACL
- `GrantPermission(uid, app, perms)` - Assign permission
- `RevokePermission(uid, app)` - Revoke access
- `AuthenticateBiometric(face_data)` - Face login

---

### 6. 🔄 Kiacha Updates (Update Manager)
**Native update system for Kernel, Brain, Modules**

Features:
- Check for updates
- Automatic/manual installation
- Rollback support
- Channel selection (Stable, Beta, Dev)
- Download management
- Update scheduling
- Changelog viewing
- Update history

**Endpoints:**
- `GET /api/updates/check` - Check for updates
- `POST /api/updates/install` - Install update
- `POST /api/updates/rollback` - Rollback update
- `GET /api/updates/channels` - Available channels
- `POST /api/updates/channel` - Change channel
- `GET /api/updates/history` - Update history
- `GET /api/updates/status` - Current install status

**gRPC Methods:**
- `CheckForUpdates()` - Available updates
- `DownloadUpdate(version)` - Start download
- `InstallUpdate(version)` - Install update
- `RollbackUpdate()` - Revert to previous
- `GetUpdateChannels()` - Available channels
- `SetUpdateChannel(channel)` - Change channel
- `GetUpdateHistory()` - Past updates

---

### 7. 🔐 Kiacha Security (Security Center)
**Privacy, encryption, and security management**

Features:
- Permission auditing
- Kernel security logs
- WASM sandbox enforcement
- Encryption management
- Vault/password manager integration
- Threat detection
- Privacy settings
- App sandbox policies

**Endpoints:**
- `GET /api/security/audit` - Audit logs
- `GET /api/security/permissions` - All permissions
- `GET /api/security/sandbox` - Sandbox status
- `GET /api/security/encryption` - Encryption info
- `POST /api/security/vault` - Vault operations
- `GET /api/security/threats` - Threat alerts
- `POST /api/security/policy` - Update policy
- `GET /api/security/certificates` - SSL certificates

**gRPC Methods:**
- `GetAuditLogs()` - Security events
- `GetAllPermissions()` - Permission matrix
- `GetSandboxStatus()` - WASM sandbox info
- `EncryptData(data)` - Encrypt content
- `DecryptData(encrypted)` - Decrypt content
- `VerifySignature(data, sig)` - Verify signature
- `GetSecurityPolicy()` - Current policy
- `UpdateSecurityPolicy(policy)` - New policy

---

## 🗂️ Directory Structure

```
kiacha-apps/
├── README.md (this file)
├── package.json (shared dependencies)
├── tsconfig.json
├── control-center/
│   ├── components/
│   │   ├── SystemSettings.tsx
│   │   ├── DeviceSettings.tsx
│   │   ├── PersonalizationSettings.tsx
│   │   ├── VoiceSettings.tsx
│   │   ├── StorageSettings.tsx
│   │   ├── SecuritySettings.tsx
│   │   ├── ModuleSettings.tsx
│   │   └── UpdateSettings.tsx
│   ├── pages/
│   │   └── ControlCenter.tsx
│   └── hooks/
│       └── useSettings.ts
├── explorer/
│   ├── components/
│   │   ├── FileList.tsx
│   │   ├── StorageAnalytics.tsx
│   │   ├── FileActions.tsx
│   │   └── SandboxBrowser.tsx
│   ├── pages/
│   │   └── Explorer.tsx
│   └── hooks/
│       └── useFileSystem.ts
├── monitor/
│   ├── components/
│   │   ├── ProcessList.tsx
│   │   ├── PerformanceGraph.tsx
│   │   ├── ProcessActions.tsx
│   │   └── ResourceAlerts.tsx
│   ├── pages/
│   │   └── Monitor.tsx
│   └── hooks/
│       └── useProcesses.ts
├── network/
│   ├── components/
│   │   ├── NetworkStatus.tsx
│   │   ├── WifiScanner.tsx
│   │   ├── FirewallRules.tsx
│   │   ├── TrafficMonitor.tsx
│   │   └── BandwidthLimiter.tsx
│   ├── pages/
│   │   └── Network.tsx
│   └── hooks/
│       └── useNetwork.ts
├── users/
│   ├── components/
│   │   ├── UserList.tsx
│   │   ├── UserForm.tsx
│   │   ├── PermissionMatrix.tsx
│   │   ├── BiometricAuth.tsx
│   │   └── SessionManager.tsx
│   ├── pages/
│   │   └── Users.tsx
│   └── hooks/
│       └── useUsers.ts
├── updates/
│   ├── components/
│   │   ├── UpdateChecker.tsx
│   │   ├── UpdateInstaller.tsx
│   │   ├── RollbackManager.tsx
│   │   ├── ChannelSelector.tsx
│   │   └── UpdateHistory.tsx
│   ├── pages/
│   │   └── Updates.tsx
│   └── hooks/
│       └── useUpdates.ts
├── security/
│   ├── components/
│   │   ├── AuditLogs.tsx
│   │   ├── PermissionAuditor.tsx
│   │   ├── SandboxMonitor.tsx
│   │   ├── EncryptionManager.tsx
│   │   ├── VaultManager.tsx
│   │   └── ThreatDetection.tsx
│   ├── pages/
│   │   └── Security.tsx
│   └── hooks/
│       └── useSecurity.ts
└── shared/
    ├── components/
    │   ├── AppShell.tsx
    │   ├── Sidebar.tsx
    │   ├── StatusBar.tsx
    │   └── Modal.tsx
    ├── hooks/
    │   ├── useApi.ts
    │   └── useWebSocket.ts
    ├── utils/
    │   ├── format.ts
    │   ├── validation.ts
    │   └── constants.ts
    └── styles/
        └── globals.css
```

---

## 🔌 API Integration

### Brain Routes (Node.js)

All apps connect via Express REST API on port 3001:
```
/api/settings/*
/api/explorer/*
/api/monitor/*
/api/network/*
/api/users/*
/api/updates/*
/api/security/*
```

### gRPC to Kernel

All APIs delegate to Rust Kernel via gRPC (port 50051):
```
KiachaKernel service:
  - GetSystemInfo()
  - GetDeviceList()
  - FsList()
  - ListProcesses()
  - GetNetworkStatus()
  - ListUsers()
  - CheckForUpdates()
  - GetAuditLogs()
  ... and 30+ more methods
```

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   cd kiacha-apps
   npm install
   ```

2. **Start all apps (development):**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Run with Kernel + Brain:**
   ```bash
   # Terminal 1: Kernel
   cd kiacha-kernel && cargo run

   # Terminal 2: Brain
   cd kiacha-brain && npm run dev

   # Terminal 3: Apps
   cd kiacha-apps && npm run dev
   ```

---

## 🏗️ Technology Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **API Communication:** REST + WebSocket + gRPC (via Brain)
- **Backend:** Node.js (Brain) + Rust (Kernel)
- **Real-time:** WebSocket for live updates

---

## 📖 Documentation

Each app has its own detailed documentation:
- `control-center/README.md` - Settings app guide
- `explorer/README.md` - File manager guide
- `monitor/README.md` - Task manager guide
- `network/README.md` - Network settings guide
- `users/README.md` - User management guide
- `updates/README.md` - Update manager guide
- `security/README.md` - Security center guide

---

## 🔄 Architecture Pattern

All apps follow this pattern:

```
User Action (React Component)
  ↓
useCustomHook (handles state, caching)
  ↓
fetch() to Brain REST API (/api/...)
  ↓
Brain Express Route Handler
  ↓
gRPC Call to Kernel
  ↓
Rust Implementation
  ↓
Response back through chain
  ↓
React Component Updates UI
```

---

## 🎯 Features

✅ **System Integration**
- Deep Kernel integration via gRPC
- Real-time metrics and monitoring
- Full permission management

✅ **User Experience**
- Native app feel with Electron-like UI
- Responsive and fast
- Offline-capable (caching)
- Dark/light theme support

✅ **Security**
- All operations logged in Kernel audit trail
- Permission-based access control
- Encrypted sensitive data
- Sandbox isolation for modules

✅ **Extensibility**
- Plugin architecture for custom settings
- Custom firewall rules
- Custom permissions and roles
- Module-level configuration

---

**🎉 Kiacha OS Native Apps are ready for development!**
