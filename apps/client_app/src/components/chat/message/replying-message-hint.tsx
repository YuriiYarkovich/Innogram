import Line from '@/components/line';
import Image from 'next/image';
import { Message } from '@/types';

const ReplyingMessageHint = ({
  replyingMessage,
  setReplyingMessage,
}: {
  replyingMessage: Message | null;
  setReplyingMessage: (message: Message | null) => void;
}) => {
  return (
    <>
      <Line thickness={2} color={'#79747e'} />
      <div className={'flex flex-row gap-5 w-full'}>
        <Image
          src={'/images/icons/reply.svg'}
          alt={'Reply icon'}
          height={30}
          width={30}
          draggable={false}
        />
        <div className={'flex flex-col gap-1'}>
          <span className={'font-bold'}>
            Replying to {replyingMessage?.authorUsername}
          </span>
          <span>{replyingMessage?.content}</span>
        </div>
        <div className={'flex items-center ml-auto'}>
          <button
            onClick={() => setReplyingMessage(null)}
            className={
              'flex items-center justify-center md:w-[37px] md:h-[37px]'
            }
          >
            <Image
              src={'/images/icons/cross.svg'}
              alt={'cancel replying icon'}
              width={30}
              height={30}
              draggable={false}
              className={'hover:md:w-[37px] hover:md:h-[37px]'}
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default ReplyingMessageHint;
