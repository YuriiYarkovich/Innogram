import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import AddFilePlaceholder from '@/components/add-file-placeholder';
import { ChatTypes, Profile } from '@/types';
import ChatCandidateTile from '@/components/chat/chat-candidate-tile';
import { fetchAllSubscriptions } from '@/services/profile.service';
import Image from 'next/image';
import { useSocket } from '@/hooks/useSocket';

type ChatCreationModalProps = {
  currentProfile: Profile;
  isOpened: boolean;
  onClose: () => void;
};

type ChatCreationFormValues = {
  otherParticipantsIds: string[];
  title: string;
  chatType: ChatTypes;
  file?: File | null;
};

const ChatCreationModal = ({
  currentProfile,
  isOpened,
  onClose,
}: ChatCreationModalProps) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ChatCreationFormValues>({
    defaultValues: {
      title: '',
      otherParticipantsIds: [],
      chatType: ChatTypes.GROUP,
      file: null,
    },
  });
  const file = watch('file');
  const otherParticipantsIds = watch('otherParticipantsIds');
  const [subscriptions, setSubscriptions] = useState<Profile[] | null>(null);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);

  const { send } = useSocket({});

  const onSubmit = async (data: ChatCreationFormValues) => {
    data.chatType =
      data.otherParticipantsIds.length > 1
        ? ChatTypes.GROUP
        : ChatTypes.PRIVATE;

    let fileData = null;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      fileData = {
        buffer: arrayBuffer,
        originalname: file.name,
        mimetype: file.type,
        size: file.size,
      };
    }

    send({
      event: 'createChat',
      data: {
        dto: { ...data },
        currentProfileId: currentProfile.id,
        file: fileData,
      },
    });
    onClose();
  };

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
    if (currentProfile.id !== '') {
      setSubscriptionsLoading(true);
      fetchAllSubscriptions(currentProfile.id)
        .then((data) => setSubscriptions(data))
        .finally(() => setSubscriptionsLoading(false));
    }
  }, [currentProfile]);

  if (!isOpened) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={'bg-[#eaddff] p-4 flex flex-col gap-3 rounded-4xl'}
      >
        <div className={`flex flex-row items-center w-full min-h-[50px] `}>
          <button
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
          <span className={`ml-25 text-[20px]`}>Creating chat</span>
        </div>
        <div className={'flex flex-row w-full min-h-[100px] p-2.5 gap-10'}>
          <div
            className={
              'flex justify-center items-center min-h-[80px] min-w-[80px] outline-black outline-1 rounded-full bg-[#d9d9d9]'
            }
          >
            <AddFilePlaceholder control={control} name={'file'} isIcon={true} />
          </div>
          <div className={'flex flex-col gap-2 p-2'}>
            <span className={'text-[14px] text-[#79747e]'}>Chat name</span>
            <input
              className={'border-b-1 border-[#79747e]'}
              {...register('title', { required: 'Title is required!' })}
            />
          </div>
        </div>
        <span className={'pl-2.5 pr-2.5 pt-2.5 text-[19px]'}>
          Pick chat participants:
        </span>
        <div
          className={
            'flex flex-col outline-1 w-full min-h-[200px] max-h-[500px] overflow-y-auto pl-1 pr-1 pt-0.5'
          }
        >
          {subscriptionsLoading ? (
            <>Loading...</>
          ) : (
            subscriptions?.map((profile) => (
              <ChatCandidateTile
                key={profile.id}
                profile={profile}
                onPickClick={onCandidatePick}
              />
            ))
          )}
        </div>
        <div className={'flex w-full min-h-[40px] items-center justify-center'}>
          <button
            className="cursor-pointer bg-[#4f378a] text-white text-center rounded-[20px] px-4 py-2 hover:bg-[#d0bcff] hover:text-black min-w-[150px]"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create chat'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatCreationModal;
