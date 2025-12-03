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
import {
  MessageReadStatus,
  MessageVisibilityStatus,
} from '@innogram/core-microservice/dist/common/enums/message.enum';
import MessageContextMenu from '@/components/chat/message-context-menu';
import Line from '@/components/line';
import ChatContextMenu from '@/components/chat/chat-context-menu';

export type MessageSendFormValues = {
  content: string;
  file: File | null;
};

export type MessageContextMenuState = {
  x: number;
  y: number;
  message: Message | null;
};

export type ChatContextMenuState = {
  x: number;
  y: number;
  chat: Chat | null;
};

export type MessageMenuAction = `edit` | 'delete' | 'reply';
export type ChatMenuAction = 'rename' | 'add' | 'exit';

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
  const [messageContextMenuState, setMessageContextMenuState] =
    useState<MessageContextMenuState | null>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [chatContextMenuState, setChatContextMenuState] =
    useState<ChatContextMenuState | null>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const chatsEndRef = useRef<HTMLDivElement | null>(null);

  const updateParticularChatInChatList = (receivedMessage: Message) => {
    console.log('pidoras');
    setChats((prevChats) => {
      if (!prevChats) return prevChats;

      return prevChats.map((chat) => {
        if (chat.id !== receivedMessage.chatId) return chat;

        console.log(
          `Setting previous last message to chat preview. Message: ${JSON.stringify(receivedMessage)}`,
        );
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

    updateParticularChatInChatList(receivedMessage);
  };

  const onMessageToServerReceived = (receivedMessage: Message) => {
    updateParticularChatInChatList(receivedMessage);
  };

  const onMessageDeleted = (messageId: string) => {
    setMessages((prevMessages) => {
      if (!prevMessages) return prevMessages;

      // Deleting message
      const updatedMessages = prevMessages.filter(
        (message) => message.id !== messageId,
      );

      // Updating status of all messages that references original one
      const messagesWithUpdatedReplies = updatedMessages.map((message) => {
        if (message.replyingMessage?.id === messageId) {
          return {
            ...message,
            replyingMessage: {
              ...message.replyingMessage,
              visibleStatus: MessageVisibilityStatus.DELETED,
            },
          };
        }
        return message;
      });

      if (messagesWithUpdatedReplies.length > 0) {
        updateParticularChatInChatList(
          messagesWithUpdatedReplies[messagesWithUpdatedReplies.length - 1],
        );
      }

      return messagesWithUpdatedReplies;
    });
  };

  const { send } = useSocket(
    onMessageToChatReceived,
    onMessageToServerReceived,
    onMessageDeleted,
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

  const handleMessagesContextMenu = (
    e: MouseEvent<HTMLDivElement>,
    message: Message,
  ): void => {
    e.preventDefault();
    setMessageContextMenuState({
      x: e.pageX,
      y: e.pageY,
      message,
    });
  };

  const handleMessageMenuAction = (action: MessageMenuAction) => {
    if (messageContextMenuState?.message) {
      console.log(
        `Picked action: ${action} for message with id: ${messageContextMenuState?.message.id}`,
      );
      switch (action) {
        case 'reply':
          setReplyingMessage(messageContextMenuState?.message);
          break;
        case 'delete':
          send({
            event: 'deleteMessage',
            data: {
              chatId: currentChat?.id,
              id: messageContextMenuState?.message?.id,
            },
          });
          break;
      }
      setMessageContextMenuState(null);
    }
  };

  const handleChatsContextMenu = (
    e: MouseEvent<HTMLDivElement>,
    chat: Chat,
  ): void => {
    e.preventDefault();
    setChatContextMenuState({
      x: e.pageX,
      y: e.pageY,
      chat,
    });
  };

  const handleChatsContextMenuButton = (
    e: MouseEvent<HTMLButtonElement>,
    chat: Chat,
  ): void => {
    e.preventDefault();
    e.stopPropagation(); // to prevent click of working further

    const rect = e.currentTarget.getBoundingClientRect();
    setChatContextMenuState({
      x: rect.left,
      y: rect.bottom,
      chat,
    });
  };

  const handleChatsMenuAction = (action: ChatMenuAction) => {
    if (chatContextMenuState?.chat) {
      console.log(
        `Picked action: ${action} for chat with id: ${chatContextMenuState?.chat.id}`,
      );
      switch (action) {
        case 'exit':
          break;
      }
    }
  };

  //closing context menus on click outside of it
  useEffect(() => {
    const handleClick = (e: Event) => {
      if (
        messageMenuRef.current &&
        !messageMenuRef.current.contains(e.target as Node)
      ) {
        setMessageContextMenuState(null);
      } else if (
        chatMenuRef.current &&
        !chatMenuRef.current.contains(e.target as Node)
      ) {
        setChatContextMenuState(null);
      }
    };

    if (messageContextMenuState || chatContextMenuState) {
      document.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [messageContextMenuState, chatContextMenuState]);

  //closing context menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      setMessageContextMenuState(null);
      setChatContextMenuState(null);
    };

    if (messageContextMenuState || chatContextMenuState) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [messageContextMenuState, chatContextMenuState]);

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
                <div
                  key={chat.id}
                  onContextMenu={(e) => handleChatsContextMenu(e, chat)}
                >
                  <ChatPreviewTile
                    chat={chat}
                    onClick={() => onChatTileClick(chat.id)}
                    onOptionsButtonClick={(e) =>
                      handleChatsContextMenuButton(e, chat)
                    }
                  />
                </div>
              ))
            )}
            <div ref={chatsEndRef} />
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
                    onContextMenu={(e) => handleMessagesContextMenu(e, message)}
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
                        Replying to {replyingMessage?.authorUsername}
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
        {messageContextMenuState && (
          <MessageContextMenu
            menuRef={messageMenuRef}
            contextMenuPosition={messageContextMenuState}
            handleMenuAction={handleMessageMenuAction}
          />
        )}
        {chatContextMenuState && (
          <ChatContextMenu
            menuRef={chatMenuRef}
            contextMenuPosition={chatContextMenuState}
            handleMenuAction={handleChatsMenuAction}
          />
        )}
      </div>
    </div>
  );
}
