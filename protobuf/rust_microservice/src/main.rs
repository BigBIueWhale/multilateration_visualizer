// Suppress non-camel-case types warning within this module
// because protobuf generates some types with non-standard Rust naming conventions
#[allow(non_camel_case_types)]

pub mod grpc_api {
    tonic::include_proto!("workhorse"); // The string specified here must match the proto package name
}

use tonic::{transport::Server, Request, Response, Status};
use futures::stream::Stream;
use std::pin::Pin;

use grpc_api::multilateral_visualizer_server::{MultilateralVisualizer, MultilateralVisualizerServer};
use grpc_api::{ReadFramesRequest, FrameData, Voxel};
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;

#[derive(Default)]
pub struct MyGrpcServer;

#[tonic::async_trait]
impl MultilateralVisualizer for MyGrpcServer {
    type read_framesStream = Pin<Box<dyn Stream<Item = Result<FrameData, Status>> + Send + Sync + 'static>>;

    async fn read_frames(&self, _request: Request<ReadFramesRequest>) -> Result<Response<Self::read_framesStream>, Status> {
        let (tx, rx) = mpsc::channel(4);

        tokio::spawn(async move {
            let voxels = vec![
                Voxel { color: "red".into(), x: 1, y: 2, z: 3 },
                Voxel { color: "blue".into(), x: 4, y: 5, z: 6 },
            ];
            let frame = FrameData { voxels };

            if tx.send(Ok(frame)).await.is_err() {
                return;
            }
            // Simulate streaming by sending another frame after a delay
            tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
            let voxels = vec![
                Voxel { color: "green".into(), x: 7, y: 8, z: 9 },
                Voxel { color: "yellow".into(), x: 10, y: 11, z: 12 },
            ];
            let frame = FrameData { voxels };
            let _ = tx.send(Ok(frame)).await;
        });

        Ok(Response::new(Box::pin(ReceiverStream::new(rx))))
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "[::1]:50051".parse()?;
    let server = MyGrpcServer::default();

    println!("Server listening on {}", addr);

    Server::builder()
        .add_service(MultilateralVisualizerServer::new(server))
        .serve(addr)
        .await?;

    Ok(())
}
