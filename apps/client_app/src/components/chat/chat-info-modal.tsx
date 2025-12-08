import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Chat, ChatParticipantProfile, Profile } from '@/types';
import { loadFromS3 } from '@/services/files.service';
import Image from 'next/image';
import { fetchChatParticipants } from '@/services/chat.service';
import ChatParticipantTile from '@/components/chat/chat-participant-tile';
import AddFilePlaceholder from '@/components/add-file-placeholder';
import { useSocket } from '@/hooks/useSocket';
import AddParticipantsModal from '@/components/chat/add-participants-modal';

type ChatInfoModalProps = {
  isOpened: boolean;
  onClose: () => void;
  currentChat?: Chat | null | undefined;
  isCurrentUserAdmin?: boolean;
  currentProfile: Profile;
};

type ChatEditingFormValues = {
  title: string;
  file?: File | string | null;
};

const ChatInfoModal = ({
  isOpened,
  onClose,
  currentChat,
  isCurrentUserAdmin = false,
  currentProfile,
}: ChatInfoModalProps) => {
  const [chat, setChat] = useState<Chat | null | undefined>(null);
  const [chatParticipants, setChatParticipants] = useState<
    ChatParticipantProfile[] | null
  >(null);
  const [chatParticipantsLoading, setChatParticipantsLoading] = useState(false);
  const [isInEditingMode, setIsInEditingMode] = useState(false);
  const [isAddParticipantsModalOpen, setIsAddParticipantsModalOpen] =
    useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ChatEditingFormValues>({
    defaultValues: {
      title: '',
      file: null,
    },
  });
  const file = watch('file');

  const { send } = useSocket({});

  const onSubmit = async (newData: ChatEditingFormValues) => {
    let fileData = null;
    if (file && file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      fileData = {
        buffer: arrayBuffer,
        originalname: file.name,
        mimetype: file.type,
        size: file.size,
      };
    }
    if (newData.title !== chat?.title || file instanceof File) {
      send({
        event: 'editChat',
        data: {
          currentProfileId: currentProfile.id,
          chatId: chat?.id,
          title: newData.title,
          file: fileData,
        },
      });
    }
    setIsInEditingMode(false);
    setChat(null);
    onClose();
  };

  useEffect(() => {
    if (chat) {
      setValue('title', chat.title || '');
      setValue('file', chat.avatarUrl || null);
    }
  }, [chat, setValue]);

  useEffect(() => {
    setChat(currentChat);
  }, [currentChat, chat]);

  useEffect(() => {
    if (chat?.avatarUrl) {
      loadFromS3(chat?.avatarUrl).then((file) => {
        setValue('file', file);
      });
    }
  }, [chat?.avatarUrl, setValue]);

  useEffect(() => {
    if (chat) {
      setChatParticipantsLoading(true);
      fetchChatParticipants(chat?.id)
        .then((chatParticipants) => {
          setChatParticipants(chatParticipants);
        })
        .finally(() => {
          setChatParticipantsLoading(false);
        });
    }
  }, [chat]);

  if (!isOpened) return null;
  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
      >
        <AddParticipantsModal
          isOpen={isAddParticipantsModalOpen}
          onClose={() => setIsAddParticipantsModalOpen(false)}
        />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={
            'flex flex-col min-w-[500px] rounded-[30px] bg-[#eaddff] justify-center items-center gap-3 pl-4 pr-4 pb-4 pt-2'
          }
        >
          <div className={`flex flex-row items-center w-full min-h-[50px]`}>
            <button
              onClick={() => {
                setIsInEditingMode(false);
                setChat(null);
                onClose();
              }}
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
            {isCurrentUserAdmin &&
              (isInEditingMode ? (
                <div className={'flex flex-row ml-auto gap-2 h-full'}>
                  <button
                    type={'submit'}
                    disabled={isSubmitting}
                    className={
                      'flex items-center justify-center min-h-[40px] min-w-[40px] cursor-pointer'
                    }
                  >
                    <Image
                      src={'/images/icons/apply.svg'}
                      alt={'apply button'}
                      width={33}
                      height={33}
                      draggable={false}
                      className={'hover:min-h-[40px] hover:min-w-[40px]'}
                    />
                  </button>
                  <button
                    type={'button'}
                    onClick={() => setIsInEditingMode(false)}
                    className={
                      'flex items-center justify-center min-h-[40px] min-w-[40px] cursor-pointer'
                    }
                  >
                    <Image
                      src={'/images/icons/cross.svg'}
                      alt={'reject button'}
                      width={33}
                      height={33}
                      draggable={false}
                      className={'hover:min-h-[40px] hover:min-w-[40px]'}
                    />
                  </button>
                </div>
              ) : (
                <div className={'flex flex-row ml-auto gap-2 h-full'}>
                  <button
                    type={'button'}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsInEditingMode(true);
                    }}
                    className={
                      'flex items-center justify-center min-h-[40px] min-w-[40px] cursor-pointer'
                    }
                  >
                    <Image
                      src={'/images/icons/edit.svg'}
                      alt={'edit button'}
                      width={33}
                      height={33}
                      draggable={false}
                      className={'hover:min-h-[40px] hover:min-w-[40px]'}
                    />
                  </button>
                </div>
              ))}
          </div>
          <div
            className={
              'flex items-center justify-center rounded-full md:w-[100px] md:h-[100px] outline-1'
            }
          >
            {isInEditingMode ? (
              <AddFilePlaceholder
                control={control}
                name={'file'}
                isIcon={true}
                iconSize={50}
              />
            ) : (
              <Image
                src={chat?.avatarUrl || '/images/avaTest.png'}
                alt={'chat avatar'}
                width={100}
                height={100}
                draggable={false}
                unoptimized
                className={'rounded-[inherit] md:w-[100px] md:h-[100px]'}
              />
            )}
          </div>
          {isInEditingMode ? (
            <input
              {...register('title')}
              className={'font-bold text-[20px] border-b-1 border-[#79747e]'}
            />
          ) : (
            <span className={'font-bold text-[20px]'}>{chat?.title}</span>
          )}

          <span className={'font-mono text-[16xp]'}>
            {`${chat?.participantsAmount} participants`}
          </span>
          <div className={'flex w-full h-min-[10px]'}>
            <span className={'text-[18px]'}>Chat participants:</span>
            <button
              type={'button'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`On add participant button click`);
                setIsAddParticipantsModalOpen(true);
              }}
              className={
                'flex ml-auto min-h-[37px] min-w-[37px] items-center justify-center cursor-pointer'
              }
            >
              <Image
                src={'/images/icons/addUser.svg'}
                alt={'add user'}
                width={30}
                height={30}
                draggable={false}
                className={'hover:min-h-[37px] hover:min-w-[37px]'}
              />
            </button>
          </div>
          <div
            className={
              'flex flex-col outline-1 w-full min-h-[200px] max-h-[500px] overflow-y-auto pl-1 pr-1 pt-0.5'
            }
          >
            {chatParticipantsLoading ? (
              <p>Chat participants loading...</p>
            ) : (
              chatParticipants?.map((chatParticipant) => (
                <ChatParticipantTile
                  key={chatParticipant.id}
                  chatParticipant={chatParticipant}
                  isCurrentProfileAdmin={isCurrentUserAdmin}
                />
              ))
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatInfoModal;
