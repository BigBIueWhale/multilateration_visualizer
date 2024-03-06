import { z } from 'zod';

// TODO: Make this data type define which voxels need to be drawn-in and
// in what color.
export const FrameData = z.object({
  data: z.instanceof(Uint8Array),
});

// Define the API using Zod schemas
export const apiSchemasServerToClient = {
  'notify-new-frame': {
    notification: FrameData,
  },
};

// Infer types from Zod schemas
export type ApiServerToClient = {
  [K in keyof typeof apiSchemasServerToClient]: {
    notification: z.infer<typeof apiSchemasServerToClient[K]['notification']>;
  };
};

// Define Channels type for preload.ts
export type ChannelsServerToClient = keyof ApiServerToClient;
