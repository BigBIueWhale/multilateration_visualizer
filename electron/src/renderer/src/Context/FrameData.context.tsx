import { createContext, useState } from "react";
import { FrameData } from "shared/src/proto/grpc_api";

export const FrameDataContext = createContext({
  // TODO
});

type FrameDataProviderProps = {
  children: React.ReactNode;
}

export const FrameDataProvider: React.FC<FrameDataProviderProps> = ({ children }) => {
  const [frameData, setFrameData] = useState<FrameData>({ voxels: [] });
  return (
    <FrameDataContext.Provider
      value={{
        // TODO
      }}
    >
      {children}
    </FrameDataContext.Provider>
  );
}
