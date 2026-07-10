import { useEffect, useRef } from 'react';
import { env } from '@/env';
import { io, Socket } from 'socket.io-client';
import { Chat, Message } from '@/types';

export const useSocket = (handlers: {
  onMessageToUserInChat?: (message: Message) => void;
  onMessageToUserInServer?: (message: Message) => void;
  onMessageDeleted?: (messageId: string) => void;
  onCurrentChatDeleted?: (chat: Chat) => void;
  onChatDeleted?: (chat: Chat) => void;
  onMessageUpdatedInChat?: (message: Message) => void;
  onMessageUpdatedInServer?: (message: Message) => void;
  onChatCreated?: (chat: Chat) => void;
  onServerChatUpdated?: (chat: Chat) => void;
}) => {
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
      if (handlers.onMessageToUserInChat)
        handlers.onMessageToUserInChat(message);
    });

    socket.on('messageToUserInServer', (message: Message) => {
      if (handlers.onMessageToUserInServer)
        handlers.onMessageToUserInServer(message);
    });

    socket.on('messageDeleted', (messageId: string) => {
      if (handlers.onMessageDeleted) handlers.onMessageDeleted(messageId);
    });

    socket.on('currentChatDeleted', (chat: Chat) => {
      if (handlers.onCurrentChatDeleted) handlers.onCurrentChatDeleted(chat);
    });

    socket.on('chatDeleted', (chat: Chat) => {
      if (handlers.onChatDeleted) handlers.onChatDeleted(chat);
    });

    socket.on('messageEditedInChat', (updatedMessage: Message) => {
      if (handlers.onMessageUpdatedInChat)
        handlers.onMessageUpdatedInChat(updatedMessage);
    });

    socket.on('messageEditedInServer', (updatedMessage: Message) => {
      if (handlers.onMessageUpdatedInServer)
        handlers.onMessageUpdatedInServer(updatedMessage);
    });

    socket.on('chatCreated', (createdChat: Chat) => {
      if (handlers.onChatCreated) handlers.onChatCreated(createdChat);
    });

    socket.on('chatUpdated', (updatedChat: Chat) => {
      if (handlers.onServerChatUpdated)
        handlers.onServerChatUpdated(updatedChat);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const send = (props: { event: string; data: unknown }) => {
    socketRef.current?.emit(props.event, props.data);
  };

  return { send };
};
