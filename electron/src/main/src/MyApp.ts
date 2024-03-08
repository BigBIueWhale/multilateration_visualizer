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
        // Avoid race condition of user pressing connect button
        // multiple times before the connect is finished.
        if (this.grpcClient !== null && this.stream === null) {
            // Early exit because another instance of this function
            // is busy doing waitForReady
            return {};
        }

        this.ResetGrpc();

        const grpcServerHost = '[::1]:50051';

        // Not a blocking call
        this.grpcClient = new MultilateralVisualizerClient(
            // Run the Rust gRPC server executable before running the electron app
            grpcServerHost,
            grpc.credentials.createInsecure(),
            {
                'grpc.keepalive_time_ms': 3000,
                'grpc.keepalive_timeout_ms': 3000,
                'grpc.keepalive_permit_without_calls': 1,
                'grpc.http2.max_pings_without_data': 0,
                'grpc.http2.min_time_between_pings_ms': 3000,
            }
        );

        // 5 seconds
        const deadlineMilliseconds: grpc.Deadline = (new Date()).getTime() + 5000;
        // Not a blocking call
        this.grpcClient.waitForReady(deadlineMilliseconds, (error: Error | undefined) => {
            try {
                if (error === undefined && this.grpcClient !== null) {
                    this.stream = this.grpcClient.readFrames({});
                    this.stream.on('error', (err: Error) => {
                        this.stream = null;
                        emitNotification(
                            browserWindow,
                            'notify-grpc-stream-error',
                            `gRPC stream error: ${err}`);
                    });
                    this.stream.on('end', () => {
                        this.stream = null;
                        emitNotification(browserWindow, 'notify-grpc-stream-end', {});
                    });
                    this.stream.on('data', (frameData: FrameData) => {
                        // Emit a notification to the client with the new frame data
                        emitNotification(browserWindow, 'notify-new-frame', frameData);
                    });
                }
                else {
                    emitNotification(
                        browserWindow,
                        'notify-grpc-connect-error',
                        `gRPC connect to host: "${grpcServerHost}" failed. Error message: ${error}`);
                }
            }
            catch (ex) {
                emitNotification(
                    browserWindow,
                    'notify-grpc-stream-error',
                    `gRPC stream invoke error: ${ex}`);
            }
            if (this.stream === null) {
                // If we failed to open the stream or to connect,
                // mark the object as null so that the user can click again
                // on the connect button and the race condition early exit
                // at the beginning of this function won't trigger.
                this.grpcClient?.close();
                this.grpcClient = null;
            }
        });
        return {};
    }

    ResetGrpc(): void {
        if (this.stream !== null) {
            this.stream.removeAllListeners('data');
            this.stream.removeAllListeners('end');
            this.stream.removeAllListeners('error');
    
            this.stream.destroy();
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
