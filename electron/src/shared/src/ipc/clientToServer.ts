import { z } from 'zod';

// Define Zod schemas for each API call

export const GrpcConnectRequest = z.object({});
export const GrpcConnectResponse = z.object({});

// Define the API using Zod schemas
export const apiSchemas = {
  'ipc-grpc-connect-or-reconnect': {
    request: GrpcConnectRequest,
    response: GrpcConnectResponse,
  },
};

// Infer types from Zod schemas
export type ApiClientToServer = {
  [K in keyof typeof apiSchemas]: {
    request: z.infer<typeof apiSchemas[K]['request']>;
    response: z.infer<typeof apiSchemas[K]['response']>;
  };
};

// Define Channels type for preload.ts
export type ChannelsClientToServer = keyof ApiClientToServer;
