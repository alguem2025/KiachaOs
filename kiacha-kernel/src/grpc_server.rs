use tonic::{Request, Response, Status};
use tracing::info;
use std::sync::Arc;
use crate::kernel::KiachaKernel;
use crate::proto::*;

pub struct KiachaKernelService {
    kernel: Arc<KiachaKernel>,
}

impl KiachaKernelService {
    pub fn new(kernel: Arc<KiachaKernel>) -> Self {
        KiachaKernelService { kernel }
    }
}

#[tonic::async_trait]
impl kiacha_kernel::KiachaKernel for KiachaKernelService {
    async fn spawn_module(
        &self,
        request: Request<ModuleRequest>,
    ) -> Result<Response<ModuleResponse>, Status> {
        let req = request.into_inner();
        info!("Spawning module: {}", req.name);

        let module_type = req.r#type();
        let module_id = self
            .kernel
            .spawn(req.name, module_type)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(ModuleResponse {
            module_id,
            status: "running".to_string(),
            created_at: chrono::Local::now().timestamp_millis(),
        }))
    }

    async fn list_modules(
        &self,
        _request: Request<::prost::well_known_types::Empty>,
    ) -> Result<Response<ModuleList>, Status> {
        let modules: Vec<ModuleInfo> = self
            .kernel
            .list_modules()
            .iter()
            .map(|m| ModuleInfo {
                id: m.id.clone(),
                name: m.name.clone(),
                r#type: m.module_type.clone() as i32,
                status: format!("{:?}", m.status),
                created_at: chrono::Local::now().timestamp_millis(),
            })
            .collect();

        Ok(Response::new(ModuleList { modules }))
    }

    async fn pause_module(
        &self,
        request: Request<::prost::wrappers::StringValue>,
    ) -> Result<Response<::prost::well_known_types::Empty>, Status> {
        let module_id = request.into_inner().value;
        self.kernel
            .pause_module(&module_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(::prost::well_known_types::Empty {}))
    }

    async fn resume_module(
        &self,
        request: Request<::prost::wrappers::StringValue>,
    ) -> Result<Response<::prost::well_known_types::Empty>, Status> {
        let module_id = request.into_inner().value;
        self.kernel
            .resume_module(&module_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(::prost::well_known_types::Empty {}))
    }

    async fn send_ipc(
        &self,
        request: Request<IpcMessage>,
    ) -> Result<Response<IpcResponse>, Status> {
        let msg = request.into_inner();
        self.kernel
            .ipc_send(&msg.from, &msg.to, msg.clone())
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(IpcResponse {
            success: true,
            message: "Message sent".to_string(),
        }))
    }

    type SubscribeToEventsStream =
        std::pin::Pin<Box<dyn futures::Stream<Item = Result<Event, Status>> + Send>>;

    async fn subscribe_to_events(
        &self,
        request: Request<::prost::wrappers::StringValue>,
    ) -> Result<Response<Self::SubscribeToEventsStream>, Status> {
        let event_type = request.into_inner().value;
        let mut rx = self.kernel.subscribe_to_events(&event_type);

        let stream = async_stream::stream! {
            while let Ok(event) = rx.recv().await {
                yield Ok(Event {
                    event_type: event.event_type.clone(),
                    source: event.source.clone(),
                    payload: event.payload.clone(),
                    timestamp: event.timestamp,
                });
            }
        };

        Ok(Response::new(Box::pin(stream)))
    }

    async fn check_permission(
        &self,
        request: Request<PermissionRequest>,
    ) -> Result<Response<PermissionResponse>, Status> {
        let req = request.into_inner();
        let permission = req.permission();

        let granted = self
            .kernel
            .check_permission(&req.module_id, permission)
            .await
            .is_ok();

        Ok(Response::new(PermissionResponse {
            granted,
            reason: if granted {
                "Permission granted".to_string()
            } else {
                "Permission denied".to_string()
            },
        }))
    }

    async fn grant_permission(
        &self,
        request: Request<PermissionRequest>,
    ) -> Result<Response<::prost::well_known_types::Empty>, Status> {
        let req = request.into_inner();
        self.kernel
            .grant_permission(&req.module_id, req.permission())
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(::prost::well_known_types::Empty {}))
    }

    async fn revoke_permission(
        &self,
        request: Request<PermissionRequest>,
    ) -> Result<Response<::prost::well_known_types::Empty>, Status> {
        let req = request.into_inner();
        self.kernel
            .revoke_permission(&req.module_id, req.permission())
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(::prost::well_known_types::Empty {}))
    }

    async fn get_resources(
        &self,
        _request: Request<::prost::well_known_types::Empty>,
    ) -> Result<Response<ResourceStats>, Status> {
        let stats = self
            .kernel
            .get_resources()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(ResourceStats {
            cpu_usage: stats.get("cpu_usage").copied().unwrap_or(0.0),
            memory_total: stats.get("memory_total").copied().unwrap_or(0.0),
            memory_used: stats.get("memory_used").copied().unwrap_or(0.0),
            memory_percent: stats.get("memory_percent").copied().unwrap_or(0.0),
            timestamp: chrono::Local::now().timestamp_millis(),
        }))
    }

    async fn run_wasm(
        &self,
        request: Request<WasmRequest>,
    ) -> Result<Response<WasmResponse>, Status> {
        let req = request.into_inner();
        match self
            .kernel
            .run_wasm(&req.module_id, &req.wasm_data, req.args)
            .await
        {
            Ok(result) => Ok(Response::new(WasmResponse {
                success: true,
                result,
                error: String::new(),
            })),
            Err(e) => Ok(Response::new(WasmResponse {
                success: false,
                result: String::new(),
                error: e.to_string(),
            })),
        }
    }

    type GetAuditLogsStream = std::pin::Pin<
        Box<dyn futures::Stream<Item = Result<::prost::wrappers::StringValue, Status>> + Send>,
    >;

    async fn get_audit_logs(
        &self,
        _request: Request<::prost::well_known_types::Empty>,
    ) -> Result<Response<Self::GetAuditLogsStream>, Status> {
        let logs = self
            .kernel
            .get_audit_logs()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let stream = async_stream::stream! {
            for log in logs {
                yield Ok(::prost::wrappers::StringValue { value: log });
            }
        };

        Ok(Response::new(Box::pin(stream)))
    }
}
