import React, { useEffect, useContext } from 'react';
import { Box } from '@mui/material';
// import { invokeRpc } from '../rpc/invokeRpc';
import { z } from 'zod';
import { offNotification, onNotification } from '../rpc/handleNotification';
import { ToastContext, ToastNotifyMode } from '../Context/Toast.context';
import { v4 as uuidv4 } from 'uuid';
import { description, version } from "../../../../release/app/package.json";
import { NewFrame } from 'shared/src/ipc/serverToClient';

export function MainPage() {
    const toastContext = useContext(ToastContext);

    // Runs on mount
    useEffect(() => {
        const onNewFrame = (val: z.infer<typeof NewFrame>) => {
            toastContext.notify(
                uuidv4(),
                `New frame received`,
                ToastNotifyMode.ERROR);
        };
        onNotification('notify-new-frame', onNewFrame);
        return () => {
            offNotification('notify-new-frame', onNewFrame);
        };
    }, []);

    return (
        <Box sx={{ padding: 2, backgroundColor: '#f5f5f5' }}>
            <h1 style={{ color: '#3f51b5' }}>
                {description} v{version}
            </h1>

        </Box>
    );
}
