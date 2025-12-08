import { SERVER } from '@/config/apiRoutes';
import returnErrorMessage from '@/utils/showAuthError';
import { Chat, ChatParticipantProfile, ChatTypes } from '@/types';

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

export const deleteChatParticipant = async (
  chatId: string,
  participantId: string,
) => {
  const response: Response = await fetch(
    `${SERVER.API.DELETE_CHAT_PARTICIPANT}${chatId}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        participantId,
      }),
    },
  );

  if (!response.ok) {
    const finalMessage: string | undefined = await returnErrorMessage(response);
    if (finalMessage) console.error(finalMessage);
    return null;
  }
};

export const giveAdminRights = async (
  chatId: string,
  participantId: string,
) => {
  const response: Response = await fetch(
    `${SERVER.API.GIVE_ADMIN_RIGHTS}${participantId}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId,
      }),
    },
  );

  if (!response.ok) {
    const finalMessage: string | undefined = await returnErrorMessage(response);
    if (finalMessage) console.error(finalMessage);
    return null;
  }
};

export const leaveChat = async (chatId: string) => {
  const response: Response = await fetch(`${SERVER.API.LEAVE_CHAT}${chatId}`, {
    method: 'PUT',
    credentials: 'include',
  });

  if (!response.ok) {
    const finalMessage: string | undefined = await returnErrorMessage(response);
    if (finalMessage) console.error(finalMessage);
    return { message: finalMessage || 'Failed to leave chat' };
  }

  // Проверяем наличие контента
  const text = await response.text();

  // Если тело пустое - всё ок, возвращаем null
  if (!text || text.trim() === '') {
    return null;
  }

  // Если есть контент - это ошибка с сервера
  try {
    const responseMessage: { message: string } = JSON.parse(text);
    return responseMessage;
  } catch (error) {
    return { message: 'Unexpected response format' };
  }
};
