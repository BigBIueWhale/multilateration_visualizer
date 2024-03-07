import { createRoot } from 'react-dom/client';
import App from './App';
import React from 'react';
import { ToastProvider } from './src/Context/Toast.context';
import { FrameDataProvider } from './src/Context/FrameData.context';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

root.render(
  <React.StrictMode>
    <ToastProvider>
      <FrameDataProvider>
        <App />
      </FrameDataProvider>
    </ToastProvider>
  </React.StrictMode>
);
