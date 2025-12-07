import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Chat, ChatParticipantProfile } from '@/types';
import { loadFromS3 } from '@/services/files.service';
import Image from 'next/image';
import { fetchChatParticipants } from '@/services/chat.service';
import ChatParticipantTile from '@/components/chat/chat-participant-tile';

type ChatInfoModalProps = {
  isOpened: boolean;
  onClose: () => void;
  currentChat?: Chat | null | undefined;
  isCurrentUserAdmin?: boolean;
};

type ChatEditingFormValues = {
  title: string;
  file?: File | null;
};

const ChatInfoModal = ({
  isOpened,
  onClose,
  currentChat,
  isCurrentUserAdmin = false,
}: ChatInfoModalProps) => {
  const [chat, setChat] = useState<Chat | null | undefined>(null);
  const [chatParticipants, setChatParticipants] = useState<
    ChatParticipantProfile[] | null
  >(null);
  const [chatParticipantsLoading, setChatParticipantsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ChatEditingFormValues>({
    defaultValues: {
      title: currentChat?.title,
      file: null,
    },
  });

  useEffect(() => {
    setChat(currentChat);
  }, [currentChat]);

  useEffect(() => {
    if (currentChat?.avatarUrl) {
      loadFromS3(currentChat?.avatarUrl).then((file) => {
        setValue('file', file);
      });
    }
  }, [currentChat?.avatarUrl, setValue]);

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
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <form
        className={
          'flex flex-col min-w-[500px] rounded-[30px] bg-[#eaddff] justify-center items-center gap-3 pl-4 pr-4 pb-4 pt-2'
        }
      >
        <div className={`flex flex-row items-center w-full min-h-[50px]`}>
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
        </div>
        <div
          className={
            'flex items-center justify-center rounded-full md:w-[100px] md:h-[100px] outline-1'
          }
        >
          <Image
            src={currentChat?.avatarUrl || '/images/avaTest.png'}
            alt={'chat avatar'}
            width={100}
            height={100}
            draggable={false}
            unoptimized
            className={'rounded-[inherit] md:w-[100px] md:h-[100px]'}
          />
        </div>
        <span className={'font-bold text-[20px]'}>{currentChat?.title}</span>
        <span className={'font-mono text-[16xp]'}>
          {`${currentChat?.participantsAmount} participants`}
        </span>
        <div className={'flex w-full h-min-[10px] pt-4'}>
          <span className={'text-[18px]'}>Chat participants:</span>
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
  );
};

export default ChatInfoModal;
