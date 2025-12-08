import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Profile } from '@/types';
import { fetchAllPossibleParticipants } from '@/services/chat.service';
import ChatCandidateTile from '@/components/chat/chat-candidate-tile';
import { useForm } from 'react-hook-form';

type AddParticipantsModalProps = {
  chatId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newParticipantsIds: string[]) => void;
};

const AddParticipantsModal = ({
  chatId,
  isOpen,
  onClose,
  onSubmit,
}: AddParticipantsModalProps) => {
  const [possibleParticipants, setPossibleParticipants] = useState<
    Profile[] | null
  >(null);
  const [possibleParticipantsLoading, setPossibleParticipantsLoading] =
    useState(false);

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<{ otherParticipantsIds: string[] }>({
    defaultValues: {
      otherParticipantsIds: [],
    },
  });

  const otherParticipantsIds = watch('otherParticipantsIds');

  const onCandidatePick = (wasPickedBefore: boolean, profileId: string) => {
    if (!wasPickedBefore) {
      if (!otherParticipantsIds.includes(profileId)) {
        setValue('otherParticipantsIds', [...otherParticipantsIds, profileId]);
      }
    } else {
      setValue(
        'otherParticipantsIds',
        otherParticipantsIds.filter((id) => id !== profileId),
      );
    }
  };

  useEffect(() => {
    if (chatId) {
      setPossibleParticipantsLoading(true);
      if (!chatId) throw new Error('Unknown chat id');
      fetchAllPossibleParticipants(chatId)
        .then((possibleParticipants) =>
          setPossibleParticipants(possibleParticipants),
        )
        .finally(() => setPossibleParticipantsLoading(false));
    }
  }, [chatId]);

  if (!isOpen) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <form
        onSubmit={handleSubmit(() => {
          console.log('Handling submit');
          onSubmit(otherParticipantsIds);
          onClose();
        })}
        className={
          'flex flex-col min-w-[400px] rounded-[30px] bg-[#eaddff] justify-center items-center gap-3 pt-2 pb-5'
        }
      >
        <div className={'flex flex-row w-full items-center pl-3.5'}>
          <button
            type={'button'}
            onClick={onClose}
            className={`flex justify-center items-center min-w-[47px] min-h-[47px]`}
          >
            <Image
              src={'/images/icons/back.png'}
              alt={'Back arrow icon'}
              height={30}
              width={30}
              className={`hover:min-h-[37px] hover:min-w-[37px]`}
            />
          </button>
          <span className={'font-bold text-[18px] ml-9'}>
            Pick participants to add:{' '}
          </span>
          <button
            type={'submit'}
            className={
              'flex items-center justify-center ml-auto mr-4 min-w-[47px] min-h-[47px] cursor-pointer'
            }
          >
            <Image
              src={'/images/icons/apply.svg'}
              alt={'add participants button'}
              height={30}
              width={30}
              draggable={false}
              className={`hover:min-h-[37px] hover:min-w-[37px]`}
            />
          </button>
        </div>
        <div
          className={
            'flex flex-col outline-1 min-w-[350px] min-h-[200px] max-h-[500px] overflow-y-auto'
          }
        >
          {possibleParticipantsLoading ? (
            <p>Loading...</p>
          ) : (
            possibleParticipants?.map((participant) => (
              <ChatCandidateTile
                profile={participant}
                onPickClick={onCandidatePick}
                key={participant.id}
              />
            ))
          )}
        </div>
      </form>
    </div>
  );
};

export default AddParticipantsModal;
