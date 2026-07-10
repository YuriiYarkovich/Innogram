import { z } from 'zod';
import '../next.config';

const schema = z.object({
  NEXT_PUBLIC_CHAT_SOCKET_SERVER_URL: z.string(),
  NEXT_PUBLIC_API_URL: z.string(),
});

export const env = schema.parse({
  NEXT_PUBLIC_CHAT_SOCKET_SERVER_URL:
    process.env.NEXT_PUBLIC_CHAT_SOCKET_SERVER_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
