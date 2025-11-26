import { SERVER } from '@/config/apiRoutes';
import returnErrorMessage from '@/utils/showAuthError';
import { Message } from '@/types';

export const fetchMessagesOfChat = async (
  lastLoadedMessageCreatedAt?: string,
  chatId?: string,
): Promise<Message[] | undefined> => {
  const response: Response = await fetch(
    `${SERVER.API.GET_MESSAGES_OF_CHAT}${chatId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lastLoadedMessageCreatedAt,
      }),
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
