import { SERVER } from '@/config/apiRoutes';
import returnErrorMessage from '@/utils/showAuthError';
import { Chat, ChatTypes } from '@/types';

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

  return await response.json();
};

export const enterOrCreateChat = async (
  receiverProfileId: string,
): Promise<Chat | undefined> => {
  const response: Response = await fetch(
    `${SERVER.API.FETCH_PRIVATE_CHAT}${receiverProfileId}`,
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

  const chatId: string | null = await response.json();

  if (!chatId) {
    return undefined;
  }

  return await fetchChatInfo(chatId);
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
  const response: Response = await fetch(
    `${SERVER.API.FETCH_CHAT_INFO}${chatId}`,
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
