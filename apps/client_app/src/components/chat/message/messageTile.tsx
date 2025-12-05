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
      {/*<a
        className={'text-[15px] text-[#79747e] cursor-pointer'}
        href={`/profile/${message.authorUsername}`}
      >
        {message.authorUsername}
      </a>
      <div className={'flex flex-row gap-3'}>
        <a
          className={
            'flex rounded-full outline-[#79747e] outline-1 md:w-[40px] md:h-[40px] cursor-pointer'
          }
          href={`/profile/${message.authorUsername}`}
        >
          <Image
            src={message.authorAvatarUrl || '/images/avaTest.png'}
            alt={'Author avatar'}
            height={40}
            width={40}
            unoptimized
            draggable={false}
            className={'rounded-[inherit]'}
          />
        </a>
        <div
          className={
            'flex flex-col gap-2 bg-[#efefef] rounded-[20px] justify-center pb-1.5 min-w-[100px] max-w-[400px]'
          }
        >
          {message.replyingMessage ? (
            <div
              className={
                'flex flex-row gap-2 bg-[#C2C2C2] h-7/8 ml-3 mt-2.5 mr-4 rounded-[7px]'
              }
            >
              <div
                className={'min-h-fit bg-[#686868] md:w-[4px] ml-1.5 mt-2 mb-2'}
              />
              {message.replyingMessage.visibleStatus ===
              MessageVisibilityStatus.DELETED ? (
                <span className={'whitespace-nowrap mr-2 pt-4 pb-4'}>
                  Message has been deleted
                </span>
              ) : (
                <div className={'flex flex-col gap-1.5 w-full h-full'}>
                  <span className={'font-bold whitespace-nowrap mr-2'}>
                    {message.replyingMessage.authorUsername}
                  </span>
                  <span>{message.replyingMessage.content}</span>
                </div>
              )}
            </div>
          ) : null}
          <div
            className={
              'flex flex-row min-w-[150px] pl-3 items-center pr-2.5 pt-2 pb-2'
            }
          >
            <span className={'text-[17px] w-full'}>{message.content}</span>

            <span className={'flex text-[15px] text-[#79747e] ml-auto'}>
              {message.createdAt ? formatTime(message.createdAt) : ''}
            </span>
          </div>
        </div>
      </div>*/}
    </div>
  );
};

export default MessageTile;
