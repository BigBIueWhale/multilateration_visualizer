import React, { createContext, useState, useContext, ReactNode, useCallback } from "react";
import { FrameData } from "../../../shared/src/proto/grpc_api";

// Define the shape of the context for reading and updating
interface FrameDataState {
  frameData: FrameData;
  connected: boolean;
}

interface FrameDataUpdateContextType {
  setFrameData: React.Dispatch<React.SetStateAction<FrameDataState>>;
}

// Create two separate contexts- to avoid re-rendering the components
// that only update the frame data.
// With this separation of concerns: only the components that read the frame
// data will be re-rendered.
export const FrameDataReadContext = createContext<FrameDataState>({
  frameData: { voxels: [] },
  connected: false,
});
export const FrameDataUpdateContext = createContext<FrameDataUpdateContextType>({
  setFrameData: () => { throw new Error("FrameDataUpdateContext is uninitialized"); }
});

type FrameDataProviderProps = {
  children: ReactNode;
};

export const FrameDataProvider: React.FC<FrameDataProviderProps> = ({ children }) => {
  const [frameData, setFrameData] = useState<FrameDataState>({
    frameData: {
      voxels: [],
    },
    connected: false
  });

  return (
    <FrameDataReadContext.Provider value={frameData}>
      <FrameDataUpdateContext.Provider value={{ setFrameData: setFrameData }}>
        {children}
      </FrameDataUpdateContext.Provider>
    </FrameDataReadContext.Provider>
  );
};
