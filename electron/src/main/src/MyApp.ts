//import { handleRpc, removeHandler } from "./rpc/handleRpc";
import { emitNotification } from "./rpc/emitNotification";
import { BrowserWindow } from "electron";
import * as grpc from '@grpc/grpc-js';
import { MultilateralVisualizerClient, FrameData } from '../../shared/src/proto/grpc_api';

export class MyApp {
    constructor(
        private grpcClient: MultilateralVisualizerClient | null = null,
    ) {}

    Reset = (): void => {
        // Close any resources here
        this.grpcClient?.close();
        this.grpcClient = null;
    }

    public setupEventHandlers(browserWindow: BrowserWindow): void {
        // This call is required for when the renderer window reloads
        // in which case .on('ready-to-show') will trigger again,
        // without .on('closed') triggering first.
        this.Reset();

        // Create a client instance
        this.grpcClient = new MultilateralVisualizerClient(
            // Run the Rust gRPC server executable before running the electron app
            '[::1]:50051',
            grpc.credentials.createInsecure(),
        );

        const stream: grpc.ClientReadableStream<FrameData> = this.grpcClient.readFrames({});
        // TODO: Continuously read, cleanup etc from the stream of new frames
        // that are received from the Rust gRPC server, and send them as push notifications
        // to the client.
    }

    public onAppClosing(): void {
        this.Reset();
    }
}
