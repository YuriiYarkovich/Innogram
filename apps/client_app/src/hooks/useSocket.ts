import { useEffect, useRef } from 'react';
import { env } from '@/env';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/types';

export const useSocket = (
  onMessageToUserInChat: (message: Message) => void,
) => {
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

    socket.on('messageToUserInChat', (message: Message) => {
      onMessageToUserInChat(message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const send = (props: { event: string; data: unknown }) => {
    console.log(`Sending data: ${JSON.stringify(props.data)}`);
    socketRef.current?.emit(props.event, props.data);
  };

  const enterChat = (data: { chatId: string; profileId: string }) => {
    socketRef.current?.emit('addToChat', data);
  };

  return { send };
};
