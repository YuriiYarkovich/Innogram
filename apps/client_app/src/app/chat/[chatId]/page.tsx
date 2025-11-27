'use client';

import { useEffect, useState } from 'react';
import { fetchProfile } from '@/services/profile.service';
import SidePanel from '@/components/sidePanel';
import ChatPreviewTile from '@/components/chat/chat-preview-tile';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import MessageTile from '@/components/chat/messageTile';
import { useParams } from 'next/navigation';
import { Chat, Message, Profile } from '@/types';
import { fetchChatsOfProfile, findChatById } from '@/services/chat.service';
import { fetchMessagesOfChat } from '@/services/messages.service';
import { useSocket } from '@/hooks/useSocket';

type MessageSendFormValues = {
  content: string;
  file: File | null;
};

export default function ChatPage() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting },
  } = useForm<MessageSendFormValues>({
    defaultValues: {
      content: '',
      file: null,
    },
  });
  const file = watch('file');

  const chatIdParam = useParams<{ chatId: string }>();

  const [curProfile, setCurProfile] = useState<Profile>({
    id: '',
    username: '',
    bio: '',
    birthday: '',
    avatarUrl: '',
    isPublic: false,
    postsAmount: 0,
    subscribersAmount: 0,
    subscriptionsAmount: 0,
    isCurrent: false,
    isSubscribed: false,
  });

  const [chats, setChats] = useState<Chat[] | null>(null);
  const [chatsLoading, setChatsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [replyingMessageId, setReplyingMessageId] = useState<string | null>(
    null,
  );

  const { send } = useSocket((data) => {
    console.log(`Message: ${data}`);
  });

  useEffect(() => {
    setChatsLoading(true);
    fetchChatsOfProfile()
      .then((chatsData: Chat[] | undefined) => {
        if (!chatsData) return;
        setChats(chatsData);
      })
      .finally(() => setChatsLoading(false));
  }, []);

  useEffect(() => {
    if (chatIdParam.chatId === '0') {
      setCurrentChat(null);
      return;
    }
    const currentChat = findChatById(chatIdParam.chatId, chats);
    if (!currentChat) return;
    setCurrentChat(currentChat);
  }, [chats, chatIdParam]);

  useEffect(() => {
    fetchProfile().then((data: Profile) => setCurProfile(data));
  }, []);

  useEffect(() => {
    if (currentChat) {
      setMessagesLoading(true);
      fetchMessagesOfChat(currentChat?.lastMessageCreatedAt, currentChat?.id)
        .then((messagesData: Message[] | undefined) => {
          if (!messagesData) return;
          setMessages(messagesData);
        })
        .finally(() => setMessagesLoading(false));
    }
  }, [currentChat]);

  const onChatTileClick = (chatId: string) => {
    const chat = findChatById(chatId, chats);
    if (!chat) return;
    setCurrentChat(chat);
  };

  const onSubmit = async (data: MessageSendFormValues) => {
    send({
      senderId: curProfile.id,
      chatId: currentChat?.id,
      replyToMessageId: replyingMessageId,
      content: data.content,
    });

    data.content = '';
  };

  return (
    <div
      className={`flex flex-row min-h-screen w-full justify-center items-center`}
    >
      <SidePanel curProfile={curProfile} />
      <div className={`flex w-5/8 h-full justify-center items-center gap-5`}>
        <div
          className={
            'flex flex-col w-1/4 h-full justify-center overflow-y-scroll'
          }
        >
          <div>
            {chatsLoading ? (
              <p>Chats list is loading...</p>
            ) : chats?.length === 0 ? (
              <p>There are no chats yet.</p>
            ) : (
              chats?.map((chat) => (
                <ChatPreviewTile
                  key={chat.id}
                  chatAvatarUrl={chat?.avatarUrl}
                  chatTitle={chat.title}
                  lastMessageContent={chat?.lastMessageContent}
                  lastMessageCreatedAt={chat?.lastMessageCreatedAt}
                  lastMessageRead={chat?.lastMessageRead}
                  onClick={() => onChatTileClick(chat.id)}
                />
              ))
            )}
          </div>
        </div>
        <div className={`flex flex-col w-5/8 h-full gap-2 overflow-y-scroll `}>
          <div
            className={`flex w-full min-h-[800px] border-black border-1 pb-1.5 items-center justify-center`}
          >
            {!currentChat ? (
              <p>Pick chat</p>
            ) : messagesLoading ? (
              <p>Messages loading...</p>
            ) : messages?.length === 0 ? (
              <p>There are no messages yet</p>
            ) : (
              <div className={'flex flex-col-reverse w-full h-full'}>
                {messages?.map((message) => (
                  <MessageTile
                    key={message.id}
                    authorUsername={message.authorUsername}
                    authorAvatarUrl={message.authorAvatarUrl}
                    content={message.content}
                  />
                ))}
              </div>
            )}
          </div>
          {!currentChat ? (
            <></>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={
                'flex flex-row w-min-1/20 border-[#79747e] border-2 rounded-4xl p-2 gap-2 items-center'
              }
            >
              <div
                className={
                  'flex items-center justify-center md:h-[34px] md:w-[34px]'
                }
              >
                <Image
                  src={'/images/icons/emoji.svg'}
                  alt={'emoji icon'}
                  height={30}
                  width={30}
                  draggable={false}
                  className={`cursor-pointer hover:md:h-[34px] hover:md:w-[34px]`}
                />
              </div>
              <textarea
                {...register('content')}
                placeholder={'Write message'}
                className={`flex w-10/12 h-full`}
              />
              <button
                type={'submit'}
                className={
                  'cursor-pointer bg-[#4f378a] text-white hover:text-black text-center rounded-[20px] px-4 py-2 hover:bg-[#d0bcff]'
                }
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
