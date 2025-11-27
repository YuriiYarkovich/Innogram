import { SERVER } from '@/config/apiRoutes';
import returnErrorMessage from '@/utils/showAuthError';
import { Message, SendingMessage } from '@/types';

export const fetchMessagesOfChat = async (
  lastLoadedMessageCreatedAt?: string,
  chatId?: string,
): Promise<Message[] | undefined> => {
  const url = new URL(`${SERVER.API.GET_MESSAGES_OF_CHAT}${chatId}`);
  if (lastLoadedMessageCreatedAt)
    url.searchParams.set(
      'lastLoadedMessageCreatedAt',
      lastLoadedMessageCreatedAt,
    );
  const response: Response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const finalMessage: string | undefined = await returnErrorMessage(response);
    if (finalMessage) console.error(finalMessage);
    return;
  }

  const receivedMessages: Message[] = await response.json();
  console.log(`Received messages: ${JSON.stringify(receivedMessages)}`);
  return receivedMessages;
};
