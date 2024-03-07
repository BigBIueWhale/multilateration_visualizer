import React, { createContext, useState, useContext, ReactNode, useCallback } from "react";
import { FrameData } from "shared/src/proto/grpc_api";

// Define the shape of the context for reading and updating
interface FrameDataReadContextType {
  frameData: FrameData;
}

interface FrameDataUpdateContextType {
  setFrameData: (frameData: FrameData) => void;
}

// Create two separate contexts- to avoid re-rendering the components
// that only update the frame data.
// With this separation of concerns: only the components that read the frame
// data will be re-rendered.
const FrameDataReadContext = createContext<FrameDataReadContextType>({ frameData: { voxels: [] } });
const FrameDataUpdateContext = createContext<FrameDataUpdateContextType>({ setFrameData: () => {} });

type FrameDataProviderProps = {
  children: ReactNode;
};

export const FrameDataProvider: React.FC<FrameDataProviderProps> = ({ children }) => {
  const [frameData, setFrameData] = useState<FrameData>({ voxels: [] });

  // Using useCallback to ensure the function identity is stable
  const updateFrameData = useCallback((data: FrameData) => {
    setFrameData(data);
  }, []);

  return (
    <FrameDataReadContext.Provider value={{ frameData }}>
      <FrameDataUpdateContext.Provider value={{ setFrameData: updateFrameData }}>
        {children}
      </FrameDataUpdateContext.Provider>
    </FrameDataReadContext.Provider>
  );
};

// Custom hooks for consuming contexts
export function useFrameData() {
  const context = useContext(FrameDataReadContext);
  return context.frameData;
}

export function useFrameDataUpdate() {
  const context = useContext(FrameDataUpdateContext);
  return context.setFrameData;
}
