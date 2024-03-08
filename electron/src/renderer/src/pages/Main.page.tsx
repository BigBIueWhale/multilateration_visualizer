import React, { useCallback, useContext } from 'react';
import { Box, Button } from '@mui/material';
import packageJson from "../../../../release/app/package.json";
import { invokeRpc } from '../rpc/invokeRpc';
import { v4 as uuidv4 } from 'uuid';
import { ToastContext, ToastNotifyMode } from "../Context/Toast.context";
import { useGrpcEventHandlers } from '../hooks/useGrpcEventHandlers.hook';
import { FrameDataReadContext, FrameDataUpdateContext } from '../Context/FrameData.context';

export function MainPage() {
    useGrpcEventHandlers();
    const toastContext = useContext(ToastContext);
    const frameDataUpdateContext = useContext(FrameDataUpdateContext);
    const connectOrReconnect = useCallback(() => {
        invokeRpc('ipc-grpc-connect-or-reconnect', {}).catch((reason) => {
            toastContext.notify(
                uuidv4(),
                `catch promise from ipc-grpc-connect-or-reconnect invocation: ${reason}`,
                ToastNotifyMode.ERROR,
            );
        }).then(() => {
          frameDataUpdateContext.setFrameData((prev) => {
            return {
              ...prev,
              connected: true,
            };
          });
        });
    }, [toastContext, frameDataUpdateContext]);

    const frameDataReadContext = useContext(FrameDataReadContext);

    const grpcIsConnected = frameDataReadContext.connected;

    return (
        <Box sx={{ padding: 2, backgroundColor: '#f5f5f5' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={connectOrReconnect}
              sx={{ marginRight: 2 }}
            >
              {grpcIsConnected ? 'Reconnect To Rust' : 'Connect To Rust'}
            </Button>
            <h1 style={{ color: '#3f51b5', margin: 0 }}>
              {packageJson.humanName} v{packageJson.version}
            </h1>
          </Box>
        </Box>
      );
}
