use sysinfo::{System, SystemExt};
use std::fs;
use std::path::Path;

/// Get detailed system information
pub fn get_system_info() -> (u32, u64, u64, u64, String, String) {
    let mut sys = System::new_all();
    sys.refresh_all();

    let cpu_cores = sys.cpus().len() as u32;
    let cpu_frequency = sys.cpus().first().map(|c| c.frequency()).unwrap_or(0);
    let memory_total = sys.total_memory() * 1024; // Convert to bytes
    let memory_free = sys.available_memory() * 1024;

    let kernel_version = env!("CARGO_PKG_VERSION").to_string();
    let os_version = std::env::consts::OS.to_string();

    (cpu_cores, cpu_frequency, memory_total, memory_free, kernel_version, os_version)
}

/// Get list of connected devices
pub fn get_devices() -> Vec<(String, String, String, bool)> {
    // Mock implementation - in real kernel, would enumerate /dev
    vec![
        ("dev-001".to_string(), "Primary Display".to_string(), "display".to_string(), true),
        ("dev-002".to_string(), "USB Hub".to_string(), "usb".to_string(), true),
        ("dev-003".to_string(), "Audio Device".to_string(), "audio".to_string(), true),
    ]
}

/// File system listing
pub fn fs_list(path: &str) -> Result<Vec<(String, bool, u64, u64, String)>, String> {
    let path_obj = Path::new(path);
    
    if !path_obj.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    let mut entries = Vec::new();

    match fs::read_dir(path_obj) {
        Ok(dir) => {
            for entry in dir.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    let name = entry.file_name().to_string_lossy().to_string();
                    let is_dir = metadata.is_dir();
                    let size = metadata.len();
                    let modified = metadata.modified()
                        .ok()
                        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                        .map(|d| d.as_secs())
                        .unwrap_or(0);
                    let permissions = format!("{:o}", metadata.permissions().mode());

                    entries.push((name, is_dir, size, modified, permissions));
                }
            }
        }
        Err(e) => return Err(e.to_string()),
    }

    Ok(entries)
}

/// Get storage statistics
pub fn get_storage_stats() -> (u64, u64, u64, f32) {
    let mut sys = System::new_all();
    sys.refresh_all();

    // Get total and used disk space
    let disks = sys.disks();
    let (mut total, mut used) = (0u64, 0u64);

    for disk in disks {
        total += disk.total_space();
        used += disk.total_space() - disk.available_space();
    }

    let free = total.saturating_sub(used);
    let percent_used = if total > 0 { (used as f32 / total as f32) * 100.0 } else { 0.0 };

    (total, used, free, percent_used)
}

/// Get list of running processes
pub fn list_processes() -> Vec<(i32, String, String, f32, u64, u64, u64, u64)> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let mut processes = Vec::new();

    for (pid, process) in sys.processes() {
        processes.push((
            pid.as_u32() as i32,
            process.name().to_string(),
            "running".to_string(),
            process.cpu_usage(),
            process.memory() * 1024, // Convert to bytes
            0, // io_read
            0, // io_write
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .ok()
                .map(|d| d.as_secs())
                .unwrap_or(0) as i64,
        ));
    }

    processes
}

/// Kill a process by PID
pub fn kill_process(pid: i32) -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        use std::process::Command;
        Command::new("kill")
            .arg("-9")
            .arg(pid.to_string())
            .output()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        Command::new("taskkill")
            .arg("/PID")
            .arg(pid.to_string())
            .arg("/F")
            .output()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[cfg(unix)]
fn get_file_permissions(metadata: &std::fs::Metadata) -> u32 {
    use std::os::unix::fs::PermissionsExt;
    metadata.permissions().mode()
}

#[cfg(not(unix))]
fn get_file_permissions(_metadata: &std::fs::Metadata) -> u32 {
    0o644 // Default if not on Unix
}
