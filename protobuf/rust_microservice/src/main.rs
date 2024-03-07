pub mod grpc_api {
    tonic::include_proto!("workhorse"); // The string specified here must match the proto package name
}
use tonic::{transport::Server, Request, Response, Status};

use grpc_api::{
    multilateral_visualizer_server::{MultilateralVisualizer, MultilateralVisualizerServer},
    ReadFramesRequest,
    FrameData,
    Voxel
};

#[derive(Default)]
pub struct MyGrpcServer;

#[tonic::async_trait]
impl MultilateralVisualizer for MyGrpcServer {
    
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "[::1]:50051".parse()?;
    let calculator = MyGrpcServer::default();

    Server::builder()
        .add_service(MultilateralVisualizerServer::new(calculator))
        .serve(addr)
        .await?;

    Ok(())
}