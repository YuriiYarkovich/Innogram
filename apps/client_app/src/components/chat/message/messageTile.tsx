import { Message } from '@/types';
import StrangerMessage from '@/components/chat/message/stranger-message';
import AuthorMessage from '@/components/chat/message/author-message';

const MessageTile = ({
  currentUserId,
  message,
  fileUrl,
}: {
  currentUserId: string;
  message: Message;
  fileUrl?: string;
}) => {
  return (
    <div className={'flex flex-col w-full min-h-[80px] pl-3 pt-1.5 gap-1'}>
      {currentUserId === message.authorProfileId ? (
        <AuthorMessage message={message} />
      ) : (
        <StrangerMessage message={message} />
      )}
    </div>
  );
};

export default MessageTile;
