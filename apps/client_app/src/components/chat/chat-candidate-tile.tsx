import React, { useState } from 'react';
import { Profile } from '@/types';
import Image from 'next/image';

type ChatCandidateTileCreationProps = {
  profile: Profile;
  onPickClick: (isClicked: boolean, profileId: string) => void;
};

const ChatCandidateTile = ({
  profile,
  onPickClick,
}: ChatCandidateTileCreationProps) => {
  const [isPicked, setIsPicked] = useState(false);
  return (
    <div className={'flex flex-row items-center w-full min-h-[55px] gap-6'}>
      <div
        className={'flex rounded-full ml-3 outline-1 max-h-[40px] max-w-[40px]'}
      >
        <Image
          src={profile.avatarUrl}
          alt={'Candidate avatar'}
          width={40}
          height={40}
          draggable={false}
          unoptimized
          loading={'eager'}
          className={'rounded-[inherit]'}
        />
      </div>
      <span className={'font-bold text-[20px]'}>{profile.username}</span>
      <button
        type={'button'}
        onClick={() => {
          onPickClick(isPicked, profile.id);
          setIsPicked((prev) => !prev);
        }}
        className={
          'flex items-center justify-center ml-auto rounded-full min-h-[20px] min-w-[20px] outline-1 mr-4'
        }
      >
        {isPicked ? (
          <div
            className={
              'min-h-[15px] min-w-[15px] rounded-[inherit] bg-[#6000FA]'
            }
          />
        ) : (
          <></>
        )}
      </button>
    </div>
  );
};

export default ChatCandidateTile;
