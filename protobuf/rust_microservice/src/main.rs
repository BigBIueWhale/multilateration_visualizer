// Suppress non-camel-case types warning within this module
// because protobuf generates some types with non-standard Rust naming conventions
#[allow(non_camel_case_types)]

pub mod grpc_api {
    tonic::include_proto!("workhorse"); // The string specified here must match the proto package name
}

use tonic::{transport::Server, Request, Response, Status};
use futures::stream::Stream;
use std::pin::Pin;
use std::sync::{Arc, atomic::{AtomicBool, Ordering}};

use grpc_api::multilateral_visualizer_server::{MultilateralVisualizer, MultilateralVisualizerServer};
use grpc_api::{ReadFramesRequest, FrameData};
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use tokio::signal;

mod algorithm;
mod filter_voxels;
mod simulation;

use crate::simulation::Simulation;

use rayon::ThreadPoolBuilder;

pub struct MyGrpcServer {
    is_running: Arc<AtomicBool>,
}

impl MyGrpcServer {
    fn new() -> Self {
        MyGrpcServer {
            is_running: Arc::new(AtomicBool::new(true)),
        }
    }
}

#[tonic::async_trait]
impl MultilateralVisualizer for MyGrpcServer {
    type read_framesStream = Pin<Box<dyn Stream<Item = Result<FrameData, Status>> + Send + Sync + 'static>>;

    async fn read_frames(&self, _request: Request<ReadFramesRequest>) -> Result<Response<Self::read_framesStream>, Status> {
        let (tx, rx) = mpsc::channel(4);

        let is_running = self.is_running.clone();

        std::thread::spawn(move || {
            let pool = ThreadPoolBuilder::new()
                .num_threads(simulation::TAGS.len())
                .build()
                .unwrap();

            let mut simulation = Simulation::new();

            while is_running.load(Ordering::Relaxed) {
                simulation.update();
                let voxels = simulation.get_frame(&pool);
                let frame = FrameData { voxels };

                if tx.blocking_send(Ok(frame)).is_err() {
                    return;
                }

                // Avoid spamming the poor slow TypeScript code😭🎻
                std::thread::sleep(std::time::Duration::from_millis(14));
            }
        });

        Ok(Response::new(Box::pin(ReceiverStream::new(rx))))
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "[::1]:50051".parse()?;
    let server = MyGrpcServer::new();
    let is_running = server.is_running.clone();

    println!("Server listening on {}", addr);

    tokio::spawn(async move {
        Server::builder()
            .add_service(MultilateralVisualizerServer::new(server))
            .serve(addr)
            .await
            .unwrap();
    });

    // Wait for CTRL+C signal
    signal::ctrl_c().await.expect("Failed to install CTRL+C signal handler");
    println!("CTRL+C received, shutting down server...");
    is_running.store(false, Ordering::Relaxed);

    Ok(())
}
