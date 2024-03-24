fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::compile_protos("../proto/grpc_api.proto")?;
    // Add icon by linking to the resource.rc file only on Windows
    #[cfg(target_os = "windows")]
    {
        println!("cargo:rustc-link-lib=dylib=./resources/resource");
    }
    Ok(())
}
