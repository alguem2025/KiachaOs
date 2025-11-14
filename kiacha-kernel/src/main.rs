mod kernel;
mod ipc;
mod permissions;
mod resources;
mod wasm_runtime;
mod security;
mod proto;
mod event_bus;
mod grpc_server;
mod system_info;
mod network_info;
mod user_manager;

use kernel::KiachaKernel;
use grpc_server::KiachaKernelService;
use std::net::SocketAddr;
use tracing::{info, Level};
use tracing_subscriber;
use std::sync::Arc;
use tonic::transport::Server;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Setup tracing
    tracing_subscriber::fmt()
        .with_max_level(Level::INFO)
        .init();

    info!("🚀 Kiacha OS Kernel starting...");

    // Initialize kernel
    let kernel = Arc::new(KiachaKernel::new().await?);

    // Create gRPC service
    let svc = KiachaKernelService::new(kernel.clone());

    // Start IPC gRPC server
    let addr: SocketAddr = "[::1]:50051".parse()?;
    info!("🌐 gRPC server listening on {}", addr);

    Server::builder()
        .add_service(proto::kiacha_kernel::kiacha_kernel_server::KiachaKernelServer::new(svc))
        .serve(addr)
        .await?;

    info!("✓ Kiacha OS Kernel running");
    Ok(())
}
