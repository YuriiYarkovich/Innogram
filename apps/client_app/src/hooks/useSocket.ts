import { useEffect, useRef } from 'react';
import { env } from '@/env';
import { io, Socket } from 'socket.io-client';

export const useSocket = (onMessage: (data: unknown) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(env.NEXT_PUBLIC_CHAT_SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to io server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from io server');
    });

    socket.on('message', (data: unknown) => {
      onMessage(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const send = (data: unknown) => {
    console.log(`Sending message: ${JSON.stringify(data)}`);
    socketRef.current?.emit('message', data);
  };

  return { send };
};
