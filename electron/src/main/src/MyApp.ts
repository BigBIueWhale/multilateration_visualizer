//import { handleRpc, removeHandler } from "./rpc/handleRpc";
import { emitNotification } from "./rpc/emitNotification";
import { handleRpc, removeHandler } from "./rpc/handleRpc";
import { GrpcConnectResponse } from '../../shared/src/ipc/clientToServer';
import { BrowserWindow } from "electron";
import * as grpc from '@grpc/grpc-js';
import { MultilateralVisualizerClient, FrameData } from '../../shared/src/proto/grpc_api';

export class MyApp {
    constructor(
        private grpcClient: MultilateralVisualizerClient | null = null,
        private stream: grpc.ClientReadableStream<FrameData> | null = null,
    ) {}

    GrpcConnectOrReconnect = async (browserWindow: BrowserWindow): Promise<Zod.infer<typeof GrpcConnectResponse>> => {
        this.ResetGrpc();

        try {
            // Blocking call, this only happens during connect so not too bad.
            this.grpcClient = new MultilateralVisualizerClient(
                // Run the Rust gRPC server executable before running the electron app
                '[::1]:50051',
                grpc.credentials.createInsecure(),
            );
        }
        catch (ex) {
            return {
                result: { errMsg: `Error connecting to gRPC server: ${ex}` },
            };
        }

        const stream: grpc.ClientReadableStream<FrameData> = this.grpcClient.readFrames({});
        stream.on('error', (err: Error) => {
            emitNotification(
                browserWindow,
                'notify-grpc-stream-error',
                `gRPC stream error: ${err}`);
        });
        stream.on('end', () => {
            emitNotification(browserWindow, "notify-grpc-stream-end", {});
        });
        stream.on('data', (frameData: FrameData) => {
            // Emit a notification to the client with the new frame data
            emitNotification(browserWindow, "notify-new-frame", frameData);
        });
        return {
            result: "connected",
        };
    }

    ResetGrpc(): void {
        if (this.stream !== null) {
            this.stream.removeAllListeners('data');
            this.stream.removeAllListeners('end');
            this.stream.removeAllListeners('error');
    
            this.stream?.destroy();
        }
        this.stream = null;

        this.grpcClient?.close();
        this.grpcClient = null;
    }

    Reset(): void {
        removeHandler('ipc-grpc-connect-or-reconnect');
        // Close any resources here
        this.ResetGrpc();
    }

    public setupEventHandlers(browserWindow: BrowserWindow): void {
        // This call is required for when the renderer window reloads
        // in which case .on('ready-to-show') will trigger again,
        // without .on('closed') triggering first.
        this.Reset();

        handleRpc(
            'ipc-grpc-connect-or-reconnect',
            async () => {
                return this.GrpcConnectOrReconnect(browserWindow);
            });
    }

    public onAppClosing(): void {
        this.Reset();
    }
}
