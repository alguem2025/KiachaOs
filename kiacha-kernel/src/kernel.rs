use dashmap::DashMap;
use std::sync::Arc;
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::ipc::IpcMessage;
use crate::permissions::{PermissionManager, Permission as PermPerm};
use crate::resources::ResourceMonitor;
use crate::wasm_runtime::WasmRuntime;
use crate::security::SecurityAudit;
use crate::event_bus::{EventBus, Event};
use crate::proto::ModuleType;
use std::net::SocketAddr;
use tracing::info;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ModuleInfo {
    pub id: String,
    pub name: String,
    pub module_type: ModuleType,
    pub status: ModuleStatus,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum ModuleType {
    Brain,
    Interface,
    Vision,
    Audio,
    Memory,
    Reasoning,
    Custom(String),
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum ModuleStatus {
    Idle,
    Running,
    Paused,
    Failed,
}

pub struct KiachaKernel {
    modules: Arc<DashMap<String, ModuleInfo>>,
    ipc_channels: Arc<DashMap<String, tokio::sync::mpsc::Sender<IpcMessage>>>,
    permissions: Arc<PermissionManager>,
    resources: Arc<ResourceMonitor>,
    wasm_runtime: Arc<WasmRuntime>,
    security_audit: Arc<SecurityAudit>,
    event_bus: Arc<EventBus>,
}

impl KiachaKernel {
    pub async fn new() -> anyhow::Result<Self> {
        let kernel = KiachaKernel {
            modules: Arc::new(DashMap::new()),
            ipc_channels: Arc::new(DashMap::new()),
            permissions: Arc::new(PermissionManager::new()),
            resources: Arc::new(ResourceMonitor::new()),
            wasm_runtime: Arc::new(WasmRuntime::new()?),
            security_audit: Arc::new(SecurityAudit::new()),
            event_bus: Arc::new(EventBus::new()),
        };

        kernel.security_audit.log("kernel_started", "Kiacha Kernel initialized");
        Ok(kernel)
    }

    /// Spawn a new module within the kernel
    pub async fn spawn(&self, name: String, module_type: crate::proto::ModuleType) -> anyhow::Result<String> {
        let module_id = Uuid::new_v4().to_string();
        
        let converted_type = match module_type {
            crate::proto::ModuleType::ModuleBrain => ModuleType::Brain,
            crate::proto::ModuleType::ModuleInterface => ModuleType::Interface,
            crate::proto::ModuleType::ModuleVision => ModuleType::Vision,
            crate::proto::ModuleType::ModuleAudio => ModuleType::Audio,
            crate::proto::ModuleType::ModuleMemory => ModuleType::Memory,
            crate::proto::ModuleType::ModuleReasoning => ModuleType::Reasoning,
            crate::proto::ModuleType::ModuleCustom => ModuleType::Custom(name.clone()),
            _ => ModuleType::Custom(name.clone()),
        };

        let module_info = ModuleInfo {
            id: module_id.clone(),
            name: name.clone(),
            module_type: converted_type.clone(),
            status: ModuleStatus::Running,
        };

        self.modules.insert(module_id.clone(), module_info);
        
        // Publish spawn event
        let event = Event {
            event_type: "module_spawned".to_string(),
            source: "kernel".to_string(),
            payload: serde_json::to_vec(&serde_json::json!({
                "module_id": &module_id,
                "name": &name
            }))?,
            timestamp: chrono::Local::now().timestamp_millis(),
        };
        self.event_bus.publish(event).await?;
        
        self.security_audit.log(&format!("module_spawn:{:?}", &converted_type), &name);
        
        info!("✓ Spawned module: {} ({})", name, module_id);
        Ok(module_id)
    }

    /// Send a message between modules via IPC
    pub async fn ipc_send(&self, from: &str, to: &str, data: IpcMessage) -> anyhow::Result<()> {
        // Check permissions
        self.permissions.check(from, PermPerm::SendIpc)?;

        if let Some(channel) = self.ipc_channels.get(to) {
            channel.send(data).await?;
            self.security_audit.log("ipc_send", &format!("{} -> {}", from, to));
            Ok(())
        } else {
            Err(anyhow::anyhow!("Module {} not found", to))
        }
    }

    /// Check if a module has permission for an action
    pub async fn check_permission(&self, module_id: &str, permission: crate::proto::Permission) -> anyhow::Result<bool> {
        let perm = match permission {
            crate::proto::Permission::PermissionSendIpc => PermPerm::SendIpc,
            crate::proto::Permission::PermissionRunWasm => PermPerm::RunWasm,
            crate::proto::Permission::PermissionAccessMemory => PermPerm::AccessMemory,
            crate::proto::Permission::PermissionAccessVision => PermPerm::AccessVision,
            crate::proto::Permission::PermissionAccessAudio => PermPerm::AccessAudio,
            crate::proto::Permission::PermissionSystemCall => PermPerm::SystemCall,
            crate::proto::Permission::PermissionAdmin => PermPerm::Admin,
            _ => return Ok(false),
        };
        Ok(self.permissions.check(module_id, perm).is_ok())
    }

    /// Grant permission to a module
    pub fn grant_permission(&self, module_id: &str, permission: crate::proto::Permission) -> anyhow::Result<()> {
        let perm = match permission {
            crate::proto::Permission::PermissionSendIpc => PermPerm::SendIpc,
            crate::proto::Permission::PermissionRunWasm => PermPerm::RunWasm,
            crate::proto::Permission::PermissionAccessMemory => PermPerm::AccessMemory,
            crate::proto::Permission::PermissionAccessVision => PermPerm::AccessVision,
            crate::proto::Permission::PermissionAccessAudio => PermPerm::AccessAudio,
            crate::proto::Permission::PermissionSystemCall => PermPerm::SystemCall,
            crate::proto::Permission::PermissionAdmin => PermPerm::Admin,
            _ => return Err(anyhow::anyhow!("Unknown permission")),
        };
        self.permissions.grant(module_id, perm);
        Ok(())
    }

    /// Revoke permission from a module
    pub fn revoke_permission(&self, module_id: &str, permission: crate::proto::Permission) -> anyhow::Result<()> {
        let perm = match permission {
            crate::proto::Permission::PermissionSendIpc => PermPerm::SendIpc,
            crate::proto::Permission::PermissionRunWasm => PermPerm::RunWasm,
            crate::proto::Permission::PermissionAccessMemory => PermPerm::AccessMemory,
            crate::proto::Permission::PermissionAccessVision => PermPerm::AccessVision,
            crate::proto::Permission::PermissionAccessAudio => PermPerm::AccessAudio,
            crate::proto::Permission::PermissionSystemCall => PermPerm::SystemCall,
            crate::proto::Permission::PermissionAdmin => PermPerm::Admin,
            _ => return Err(anyhow::anyhow!("Unknown permission")),
        };
        self.permissions.revoke(module_id, perm);
        Ok(())
    }

    /// Get current resource utilization
    pub async fn get_resources(&self) -> anyhow::Result<HashMap<String, f64>> {
        let stats = self.resources.get_stats().await;
        Ok(stats)
    }

    /// Run WASM code in a sandbox
    pub async fn run_wasm(&self, module_id: &str, wasm_data: &[u8], args: Vec<String>) -> anyhow::Result<String> {
        self.permissions.check(module_id, PermPerm::RunWasm)?;
        let result = self.wasm_runtime.execute(wasm_data, args).await?;
        self.security_audit.log("wasm_run", module_id);
        Ok(result)
    }

    /// Get security audit logs
    pub async fn get_audit_logs(&self) -> anyhow::Result<Vec<String>> {
        Ok(self.security_audit.get_logs())
    }

    /// Subscribe to events
    pub fn subscribe_to_events(&self, event_type: &str) -> tokio::sync::broadcast::Receiver<Event> {
        self.event_bus.subscribe(event_type.to_string())
    }

    /// List all active modules
    pub fn list_modules(&self) -> Vec<ModuleInfo> {
        self.modules.iter().map(|r| r.value().clone()).collect()
    }

    /// Pause a module
    pub async fn pause_module(&self, module_id: &str) -> anyhow::Result<()> {
        if let Some(mut module) = self.modules.get_mut(module_id) {
            module.status = ModuleStatus::Paused;
            self.security_audit.log("module_pause", module_id);
            Ok(())
        } else {
            Err(anyhow::anyhow!("Module not found"))
        }
    }

    /// Resume a module
    pub async fn resume_module(&self, module_id: &str) -> anyhow::Result<()> {
        if let Some(mut module) = self.modules.get_mut(module_id) {
            module.status = ModuleStatus::Running;
            self.security_audit.log("module_resume", module_id);
            Ok(())
        } else {
            Err(anyhow::anyhow!("Module not found"))
        }
    }
}
