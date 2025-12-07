import { ChatParticipantProfile } from '@/types';
import Image from 'next/image';
import { ChatParticipantRole } from '@innogram/core-microservice/dist/common/enums/chat.enum';

type ChatParticipantTileCreationProps = {
  chatParticipant: ChatParticipantProfile;
  isCurrentProfileAdmin: boolean;
};

const ChatParticipantTile = ({
  chatParticipant,
  isCurrentProfileAdmin,
}: ChatParticipantTileCreationProps) => {
  return (
    <div className={'flex flex-row items-center w-full min-h-[55px] gap-6'}>
      <div
        className={'flex rounded-full ml-3 outline-1 max-h-[40px] max-w-[40px]'}
      >
        <Image
          src={chatParticipant.avatarUrl || '/images/avaTest.png'}
          alt={'Candidate avatar'}
          width={40}
          height={40}
          draggable={false}
          unoptimized
          className={'rounded-[inherit] min-h-[40px] min-w-[40px]'}
        />
      </div>
      <a
        href={`/profile/${chatParticipant.username}`}
        className={'font-bold text-[20px]'}
      >
        {chatParticipant.username}
      </a>
      {isCurrentProfileAdmin ? (
        chatParticipant.role === ChatParticipantRole.ADMIN ? (
          <Image
            src={'/images/icons/admin.svg'}
            alt={'Admin icon'}
            height={20}
            width={20}
            draggable={false}
            className={'h-full ml-auto mr-5'}
          />
        ) : (
          <div
            className={
              'flex h-full ml-auto gap-2.5 mr-5 min-h-[27px] min-w-[27px]'
            }
          >
            <button
              type={'button'}
              className={
                'flex min-h-[27px] min-w-[27px] items-center justify-center cursor-pointer'
              }
            >
              <Image
                src={'/images/icons/make-admin.svg'}
                alt={'Delete user'}
                height={20}
                width={20}
                draggable={false}
                className={'hover:min-w-[27px] hover:min-h-[27px]'}
              />
            </button>
            <button
              type={'button'}
              className={
                'flex min-h-[27px] min-w-[27px] items-center justify-center cursor-pointer'
              }
            >
              <Image
                src={'/images/icons/delete.svg'}
                alt={'Delete user'}
                height={20}
                width={20}
                draggable={false}
                className={'hover:min-w-[27px] hover:min-h-[27px]'}
              />
            </button>
          </div>
        )
      ) : (
        chatParticipant.role === ChatParticipantRole.ADMIN && (
          <Image
            src={'/images/icons/admin.svg'}
            alt={'Admin icon'}
            height={20}
            width={20}
            draggable={false}
            className={'h-full ml-auto mr-5'}
          />
        )
      )}
    </div>
  );
};

export default ChatParticipantTile;
