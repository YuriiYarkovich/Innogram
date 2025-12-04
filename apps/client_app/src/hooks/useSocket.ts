import { useEffect, useRef } from 'react';
import { env } from '@/env';
import { io, Socket } from 'socket.io-client';
import { Chat, Message } from '@/types';

export const useSocket = (
  onMessageToUserInChat?: (message: Message) => void,
  onMessageToUserInServer?: (message: Message) => void,
  onMessageDeleted?: (messageId: string) => void,
  onCurrentChatDeleted?: (chat: Chat) => void,
  onChatDeleted?: (chat: Chat) => void,
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
      if (onMessageToUserInChat) onMessageToUserInChat(message);
    });

    socket.on('messageToUserInServer', (message: Message) => {
      if (onMessageToUserInServer) onMessageToUserInServer(message);
    });

    socket.on('messageDeleted', (messageId: string) => {
      if (onMessageDeleted) onMessageDeleted(messageId);
    });

    socket.on('currentChatDeleted', (chat: Chat) => {
      if (onCurrentChatDeleted) onCurrentChatDeleted(chat);
    });

    socket.on('chatDeleted', (chat: Chat) => {
      if (onChatDeleted) onChatDeleted(chat);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const send = (props: { event: string; data: unknown }) => {
    socketRef.current?.emit(props.event, props.data);
  };

  const enterChat = (data: { chatId: string; profileId: string }) => {
    socketRef.current?.emit('addToChat', data);
  };

  return { send };
};
