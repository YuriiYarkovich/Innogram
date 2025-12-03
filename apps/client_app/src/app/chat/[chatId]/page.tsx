'use client';

import { MouseEvent, useEffect, useRef, useState } from 'react';
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
import { MessageReadStatus } from '@innogram/core-microservice/dist/common/enums/message.enum';
import MessageContextMenu from '@/components/chat/message-context-menu';
import Line from '@/components/line';
import Separator from '@/components/auth/separator';

export type MessageSendFormValues = {
  content: string;
  file: File | null;
};

export type ContextMenuState = {
  x: number;
  y: number;
  message: Message | null;
};

export type MenuAction = `edit` | 'delete' | 'reply';

export default function ChatPage() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
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
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [contextMenuState, setContextMenuState] =
    useState<ContextMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const updateParticularChatInChatLists = (receivedMessage: Message) => {
    setChats((prevChats) => {
      if (!prevChats) return prevChats;

      return prevChats.map((chat) => {
        if (chat.id !== receivedMessage.chatId) return chat;

        return {
          ...chat,
          lastMessageRead: receivedMessage.read,
          lastMessageCreatedAt: receivedMessage.createdAt,
          lastMessageContent: receivedMessage.content,
        };
      });
    });
  };

  const onMessageToChatReceived = (receivedMessage: Message) => {
    setMessages((prev) =>
      prev ? [...prev, receivedMessage] : [receivedMessage],
    );

    updateParticularChatInChatLists(receivedMessage);
  };

  const onMessageToServerReceived = (receivedMessage: Message) => {
    updateParticularChatInChatLists(receivedMessage);
  };

  const { send } = useSocket(
    onMessageToChatReceived,
    onMessageToServerReceived,
  );

  const updateChats = () => {
    setChatsLoading(true);
    fetchChatsOfProfile()
      .then((chatsData: Chat[] | undefined) => {
        if (!chatsData) return;
        setChats(chatsData);
      })
      .finally(() => setChatsLoading(false));
  };

  const onChatTileClick = (chatId: string) => {
    if (currentChat) {
      send({
        event: 'exitChat',
        data: {
          chatId: chatId,
        },
      });
      setCurrentChat(null);
    }

    const chat = findChatById(chatId, chats);
    if (!chat) return;
    setCurrentChat(chat);

    send({
      event: 'enteredChat',
      data: {
        chatId: chatId,
      },
    });
  };

  const onSubmit = async (messageData: MessageSendFormValues) => {
    send({
      event: 'message',
      data: {
        senderId: curProfile.id,
        chatId: currentChat?.id,
        replyToMessageId: replyingMessage?.id,
        content: messageData.content,
      },
    });

    reset({ content: '' });
    setReplyingMessage(null);
  };

  const handleContextMenu = (
    e: MouseEvent<HTMLDivElement>,
    message: Message,
  ): void => {
    e.preventDefault();
    setContextMenuState({
      x: e.pageX,
      y: e.pageY,
      message,
    });
  };

  const handleMenuAction = (action: MenuAction) => {
    if (contextMenuState?.message) {
      console.log(
        `Picked action: ${action} for message with id: ${contextMenuState?.message.id}`,
      );
      switch (action) {
        case 'reply':
          setReplyingMessage(contextMenuState?.message);
          break;
      }
      setContextMenuState(null);
    }
  };

  //closing context menu on click outside of it
  useEffect(() => {
    const handleClick = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenuState(null);
      }
    };

    if (contextMenuState) {
      document.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [contextMenuState]);

  //closing context menu on scroll
  useEffect(() => {
    const handleScroll = () => setContextMenuState(null);

    if (contextMenuState) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [contextMenuState]);

  useEffect(() => {
    updateChats();
  }, []);

  useEffect(() => {
    if (!currentChat && chatIdParam.chatId === '0') {
      setCurrentChat(null);
      return;
    }
    const pickedChat = findChatById(chatIdParam.chatId, chats);
    if (!pickedChat) return;
    setCurrentChat(pickedChat);
  }, [chats, chatIdParam, currentChat]);

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
          currentChat.lastMessageRead = MessageReadStatus.READ;
        })
        .finally(() => setMessagesLoading(false));
    }
  }, [currentChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        <div className={`flex flex-col w-5/8 h-full gap-2`}>
          <div className={`flex w-full h-[800px] border-black border-1 pb-1.5`}>
            {!currentChat ? (
              <p className={'flex items-center justify-center w-full h-full'}>
                Pick chat
              </p>
            ) : messagesLoading ? (
              <p className={'flex items-center justify-center w-full h-full'}>
                Messages loading...
              </p>
            ) : messages?.length === 0 ? (
              <p className={'flex items-center justify-center w-full h-full'}>
                There are no messages yet
              </p>
            ) : (
              <div
                className={
                  'flex flex-col justify-end w-full h-full overflow-y-auto'
                }
              >
                {messages?.map((message) => (
                  <div
                    key={message.id}
                    onContextMenu={(e) => handleContextMenu(e, message)}
                  >
                    <MessageTile message={message} />
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          {!currentChat ? (
            <></>
          ) : (
            <>
              {replyingMessage && (
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
                        Responding to {replyingMessage?.authorUsername}
                      </span>
                      <span>{replyingMessage.content}</span>
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
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className={
                  'flex flex-row w-min-1/20 border-[#79747e] border-2 rounded-4xl p-2 gap-3 items-center pl-5'
                }
              >
                <textarea
                  {...register('content')}
                  placeholder={'Write message'}
                  className={`flex w-full h-full`}
                />
                <button
                  type={'submit'}
                  className={
                    'cursor-pointer bg-[#4f378a] text-white hover:text-black text-center rounded-[20px] px-4 py-2 hover:bg-[#d0bcff] ml-auto'
                  }
                >
                  {isSubmitting ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          )}
        </div>
        {contextMenuState && (
          <MessageContextMenu
            menuRef={menuRef}
            contextMenuPosition={contextMenuState}
            handleMenuAction={handleMenuAction}
          />
        )}
      </div>
    </div>
  );
}
