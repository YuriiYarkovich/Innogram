import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SubscriptionRequest } from '@/types';
import { FollowAcceptedStatus } from '@/enums';

type RequetTileProps = {
  request: SubscriptionRequest;
  onDelete: (requestId: string) => void;
};

const RequestTile = ({ request }: RequetTileProps) => {
  const [isRejected, setIsRejected] = useState(false);

  const onRejectButtonClick = () => {
    setIsRejected((prev) => !prev);
  };

  useEffect(() => {
    if (request.status === FollowAcceptedStatus.REJECTED) setIsRejected(true);
  }, [request.status]);

  return (
    <div className={'flex flex-row w-full h-min-[50px] px-3 py-1.5 gap-6'}>
      <div
        className={
          'flex items-center justify-center rounded-full border-1 min-h-[40px] min-w-[40px]'
        }
      >
        <Image
          src={request.followerProfileAvatarUrl || '/images/avaTest.png'}
          alt={'Request sender avatar'}
          width={40}
          height={40}
          draggable={false}
          unoptimized
          className={'rounded-[inherit] md:w-[40px] md:h-[40px]'}
        />
      </div>
      <Link
        href={`/profiles/${request.followerProfileUsername}`}
        className={'text-[20px] font-bold pt-1'}
      >
        {request.followerProfileUsername}
      </Link>
      <div
        className={'flex flex-row items-center justify-center ml-auto gap-2'}
      >
        <button
          type={'button'}
          //onClick={onUnsubscribe}
          className={
            'flex items-center justify-center ml-auto min-h-[20px] min-w-[70px] rounded-2xl outline-1 mr-4 bg-[#4f378a] hover:bg-[#d0bcff] text-white p-1.5 hover:text-black cursor-pointer'
          }
        >
          Accept
        </button>
        <button
          type={'button'}
          onClick={onRejectButtonClick}
          className={
            'flex items-center justify-center ml-auto min-h-[20px] min-w-[70px] rounded-2xl outline-1 mr-4 bg-[#4f378a] hover:bg-[#d0bcff] text-white p-1.5 hover:text-black cursor-pointer'
          }
        >
          {!isRejected ? 'Reject' : 'Rejected'}
        </button>
      </div>
    </div>
  );
};

export default RequestTile;
