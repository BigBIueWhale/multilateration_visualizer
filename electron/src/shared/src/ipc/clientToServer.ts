import { z } from 'zod';

// Define Zod schemas for each API call

export const ExampleCallRequest = z.object({});
export const ExampleCallResponse = z.void();

// Define the API using Zod schemas
export const apiSchemas = {
  'ipc-example-call': {
    request: ExampleCallRequest,
    response: ExampleCallResponse,
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
