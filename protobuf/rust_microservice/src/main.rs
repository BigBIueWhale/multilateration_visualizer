use tonic::{transport::Server, Request, Response, Status};
use tokio_serial::{SerialStream, SerialPortBuilderExt};
use serialcomm::serial_comm_service_server::{SerialCommService, SerialCommServiceServer};
use serialcomm::{OpenPortRequest, OpenPortResponse, ClosePortRequest, ClosePortResponse, WriteRequest, WriteResponse, ReadRequest, ReadResponse, AvailableSerialPortsRequest, AvailableSerialPortsResponse};
use futures::Stream;
use std::pin::Pin;
use tokio::sync::Mutex;
use std::sync::{Arc};
use std::io::{Write};
use tokio::sync::mpsc;
use tokio::io::AsyncReadExt;

pub mod serialcomm {
    tonic::include_proto!("serialcomm"); // The string specified here must match the proto package name
}

#[derive(Debug, Default)]
pub struct MySerialCommService {
    serial_port: Arc<Mutex<Option<SerialStream>>>,
}

#[tonic::async_trait]
impl SerialCommService for MySerialCommService {
    async fn open_serial_port(&self, request: Request<OpenPortRequest>) -> Result<Response<OpenPortResponse>, Status> {
        let req = request.into_inner();
        let mut serial_port = self.serial_port.lock().await;
    
        *serial_port = match tokio_serial::new(&req.port, req.baud_rate as u32).open_native_async() {
            Ok(port) => Some(port),
            Err(e) => return Err(Status::internal(format!("Failed to open port: {}", e))),
        };
    
        Ok(Response::new(OpenPortResponse { success: true, error: "".into() }))
    }

    async fn close_serial_port(&self, request: Request<ClosePortRequest>) -> Result<Response<ClosePortResponse>, Status> {
        let mut serial_port = self.serial_port.lock().await;
        if let Some(port) = serial_port.as_mut() {
            drop(port); // Explicitly drop the SerialStream, which closes the serial port
            Ok(Response::new(ClosePortResponse { success: true, error: "".to_string() }))
        } else {
            Err(Status::internal("Serial port is not open".to_string()))
        }
    }

    async fn write_to_serial(&self, request: Request<WriteRequest>) -> Result<Response<WriteResponse>, Status> {
        let req = request.into_inner();
        let data = req.data.into_bytes(); // Convert String to Vec<u8>
        let mut serial_port = self.serial_port.lock().await;
        if let Some(port) = serial_port.as_mut() {
            if let Err(e) = port.write_all(&data) {
                return Err(Status::internal(format!("Failed to write to port: {}", e)));
            }
        } else {
            return Err(Status::internal("Serial port is not open".to_string()));
        }
        Ok(Response::new(WriteResponse { success: true, error: "".to_string() }))
    }

    type ReadFromSerialStream = Pin<Box<dyn Stream<Item = Result<ReadResponse, Status>> + Send + Sync>>;

    async fn read_from_serial(&self, request: Request<ReadRequest>) -> Result<Response<Self::ReadFromSerialStream>, Status> {
        let (tx, mut rx) = mpsc::channel(32); // Adjust the channel size as needed
    
        // Spawn a new task to read from the serial port
        let serial_port = self.serial_port.clone();
        tokio::spawn(async move {
            if let Some(port) = serial_port.lock().await.as_mut() {
                let mut buf = [0u8; 1024]; // Buffer size
                loop {
                    match port.read(&mut buf).await { // Use AsyncReadExt's read method
                        Ok(count) => {
                            let data = String::from_utf8_lossy(&buf[..count]).to_string();
                            if tx.send(Ok(ReadResponse { data, error: "".into() })).await.is_err() {
                                break; // Exit if receiver is dropped
                            }
                        }
                        Err(e) => {
                            let _ = tx.send(Err(Status::internal(format!("Read error: {}", e)))).await;
                            break;
                        }
                    }
                }
            }
        });
    
        // Create an async stream from the receiver
        let output_stream = async_stream::stream! {
            while let Some(result) = rx.recv().await {
                yield result;
            }
        };
    
        Ok(Response::new(Box::pin(output_stream) as Self::ReadFromSerialStream))
    }

    async fn list_available_serial_ports(&self, request: Request<AvailableSerialPortsRequest>) -> Result<Response<AvailableSerialPortsResponse>, Status> {
        let ports = tokio_serial::available_ports().unwrap_or_else(|_| vec![]);
        let port_names = ports.into_iter().map(|p| p.port_name).collect();
        Ok(Response::new(AvailableSerialPortsResponse { port_names: port_names }))
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "127.0.0.1:50051".parse()?;
    let service = MySerialCommService {
        serial_port: Arc::new(Mutex::new(None)),
    };

    Server::builder()
        .add_service(SerialCommServiceServer::new(service))
        .serve(addr)
        .await?;

    Ok(())
}