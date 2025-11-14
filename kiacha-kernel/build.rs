use tonic_build;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Compile proto files
    tonic_build::compile_protos("../shared/proto/kiacha.proto")?;
    Ok(())
}
