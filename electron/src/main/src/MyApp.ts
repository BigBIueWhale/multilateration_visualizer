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
        const grpcServerHost = '[::1]:50051';

        if (this.grpcClient === null) {
            // Not a blocking call
            this.grpcClient = new MultilateralVisualizerClient(
                // Run the Rust gRPC server executable before running the electron app
                grpcServerHost,
                grpc.credentials.createInsecure()
            );
        }

        // 0.5 seconds
        const deadlineMilliseconds: grpc.Deadline = (new Date()).getTime() + 500;
        // Not a blocking call
        this.grpcClient.waitForReady(deadlineMilliseconds, (error: Error | undefined) => {
            if (this.stream !== null) {
                return;
            }
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
                    // If we failed to open the stream or to connect,
                    // mark the object as null so that the user can click again
                    // on the connect button and the race condition early exit
                    // at the beginning of this function won't trigger.
                    this.grpcClient = null;
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
        });
        return {};
    }

    Reset(): void {
        removeHandler('ipc-grpc-connect-or-reconnect');
        // Close any resources here
        this.stream?.removeAllListeners('data');
        this.stream?.removeAllListeners('end');
        this.stream?.removeAllListeners('error');

        const streamClosed = (arg: any | undefined) => {
            console.log(`Stream closed: ${arg !== undefined ? arg : ""}`);
        };

        this.stream?.on('end', streamClosed);
        // It's required to set a error handler, otherwise
        // any errors causes a global crash of the program.
        this.stream?.on('error', streamClosed);

        this.stream?.pause();
        this.stream?.cancel();
        this.stream?.destroy();

        this.stream = null;

        this.grpcClient?.close();
        this.grpcClient = null;
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
