import { useContext, useEffect } from "react";
import { FrameDataUpdateContext } from "../Context/FrameData.context";
import { offNotification, onNotification } from "../rpc/handleNotification";
import { FrameDataSchema, GrpcConnectErrorSchema, GrpcStreamEndSchema, GrpcStreamErrorSchema } from "../../../shared/src/ipc/serverToClient";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { ToastContext, ToastNotifyMode } from "../Context/Toast.context";

export function useGrpcEventHandlers() {
    const frameDataUpdateContext = useContext(FrameDataUpdateContext);
    const toastContext = useContext(ToastContext);

    useEffect(() => {
        const onConnectError = (arg: z.infer<typeof GrpcConnectErrorSchema>) => {
            const errMsg: string = arg;
            toastContext.notify(
                uuidv4(),
                `GrpcConnectError received from "main": ${errMsg}`,
                ToastNotifyMode.ERROR);
            frameDataUpdateContext.setFrameData((prev) => {
                return {
                    ...prev,
                    connected: false,
                }
            });
        };
        const onStreamError = (arg: z.infer<typeof GrpcStreamErrorSchema>) => {
            const errMsg: string = arg;
            toastContext.notify(
                uuidv4(),
                `GrpcStreamError received from "main": ${errMsg}`,
                ToastNotifyMode.ERROR);
            frameDataUpdateContext.setFrameData((prev) => {
                return {
                    ...prev,
                    connected: false,
                }
            });
        };
        const onEnd = (_: z.infer<typeof GrpcStreamEndSchema>) => {
            toastContext.notify(
                uuidv4(),
                `GrpcStreamEnd reported by "main"`,
                ToastNotifyMode.ERROR);
            frameDataUpdateContext.setFrameData((prev) => {
                return {
                    ...prev,
                    connected: false,
                }
            });
        };
        const onNewFrame = (newFrame: z.infer<typeof FrameDataSchema>) => {
            frameDataUpdateContext.setFrameData((prev) => {
                return {
                    ...prev,
                    frameData: newFrame,
                }
            });
        };
        onNotification('notify-grpc-connect-error', onConnectError);
        onNotification('notify-grpc-stream-error', onStreamError);
        onNotification('notify-grpc-stream-end', onEnd);
        onNotification('notify-new-frame', onNewFrame);
        return () => {
            offNotification('notify-grpc-connect-error', onConnectError);
            offNotification('notify-grpc-stream-error', onStreamError);
            offNotification('notify-grpc-stream-end', onEnd);
            offNotification('notify-new-frame', onNewFrame);
        };
    }, [frameDataUpdateContext, toastContext]);
}
