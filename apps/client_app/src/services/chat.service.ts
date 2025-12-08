import { SERVER } from '@/config/apiRoutes';
import returnErrorMessage from '@/utils/showAuthError';
import { Chat, ChatParticipantProfile, ChatTypes } from '@/types';
import { asyncWrapProviders } from 'node:async_hooks';

export const fetchChatsOfProfile = async (): Promise<Chat[] | undefined> => {
  const response: Response = await fetch(
    SERVER.API.FETCH_ALL_CHATS_OF_PROFILE,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (!response.ok) {
    const finalMessage: string | undefined = await returnErrorMessage(response);
    if (finalMessage) console.error(finalMessage);
    return;
  }

  const receivedChats: Chat[] = await response.json();
  /*console.log('Received chats: ');
  receivedChats.forEach((receivedChat) => {
    console.log(JSON.stringify(receivedChat) + '\n');
  });*/
  return receivedChats;
};

export const createChat = async (
  participantsIds: string[],
  title?: string,
): Promise<Chat | undefined> => {
  const response: Response = await fetch(SERVER.API.CREATE_CHAT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      otherParticipantsIds: participantsIds,
      chatType:
        participantsIds.length > 1 ? ChatTypes.GROUP : ChatTypes.PRIVATE,
    }),
  });

  if (!response.ok) {
    const finalMessage: string | undefined = await returnErrorMessage(response);
    if (finalMessage) console.error(finalMessage);
    return;
  }

  const data: Chat = await response.json();
  return data;
};

export const fetchChatInfo = async (
  chatId: string,
): Promise<Chat | undefined> => {
  const response: Response = await fetch(`${SERVER.API.CHAT_INFO}${chatId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const finalMessage: string | undefined = await returnErrorMessage(response);
    if (finalMessage) console.error(finalMessage);
    return;
  }

  return await response.json();
};

export const findChatById = (
  wantedChatId: string,
  chatsArray: Chat[] | null,
) => {
  if (!chatsArray) return;
  for (const chat of chatsArray) {
    if (chat.id === wantedChatId) return chat;
  }
};

export const fetchChatParticipants = async (
  chatId: string,
): Promise<ChatParticipantProfile[] | null> => {
  const response = await fetch(`${SERVER.API.CHAT_PARTICIPANTS}${chatId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const finalMessage: string | undefined = await returnErrorMessage(response);
    if (finalMessage) console.error(finalMessage);
    return null;
  }

  return await response.json();
};

export const fetchAllPossibleParticipants = async (chatId: string) => {
  const response: Response = await fetch(
    `${SERVER.API.POSSIBLE_CHAT_PARTICIPANTS}${chatId}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (!response.ok) {
    const finalMessage: string | undefined = await returnErrorMessage(response);
    if (finalMessage) console.error(finalMessage);
    return null;
  }

  return await response.json();
};

export const addChatParticipant = async (
  chatId: string,
  participantsIds: string[],
) => {
  const response: Response = await fetch(
    `${SERVER.API.ADD_CHAT_PARTICIPANT}${chatId}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        participantsIds,
      }),
    },
  );

  if (!response.ok) {
    const finalMessage: string | undefined = await returnErrorMessage(response);
    if (finalMessage) console.error(finalMessage);
    return null;
  }
};
