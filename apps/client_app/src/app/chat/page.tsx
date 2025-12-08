'use client';

import { MouseEvent, useEffect, useRef, useState } from 'react';
import { fetchProfile } from '@/services/profile.service';
import SidePanel from '@/components/sidePanel';
import ChatPreviewTile from '@/components/chat/chat-preview-tile';
import { useForm } from 'react-hook-form';
import MessageTile from '@/components/chat/message/messageTile';
import { useParams } from 'next/navigation';
import { Chat, Message, Profile } from '@/types';
import {
  fetchChatInfo,
  fetchChatsOfProfile,
  findChatById,
  leaveChat,
} from '@/services/chat.service';
import { fetchMessagesOfChat } from '@/services/messages.service';
import { useSocket } from '@/hooks/useSocket';
import {
  MessageReadStatus,
  MessageVisibilityStatus,
} from '@innogram/core-microservice/dist/common/enums/message.enum';
import MessageContextMenu from '@/components/chat/message/message-context-menu';
import ChatContextMenu from '@/components/chat/chat-context-menu';
import ReplyingMessageHint from '@/components/chat/message/replying-message-hint';
import EditingMessageHint from '@/components/chat/message/editing-message-hint';
import ChatCreationModal from '@/components/chat/chat-creation-modal';
import AddChatButton from '@/components/chat/addChat.button';
import ChatInfoModal from '@/components/chat/chat-info-modal';
import ErrorModal from '@/components/error-modal';
import Image from 'next/image';
import { resolveAppleWebApp } from 'next/dist/lib/metadata/resolvers/resolve-basics';

export type MessageSendFormValues = {
  content: string;
  files: File[];
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
export type ChatMenuAction = 'delete' | 'info' | 'leave';

export default function ChatPage() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<MessageSendFormValues>({
    defaultValues: {
      content: '',
      files: [],
    },
  });
  const files = watch('files');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const currentFiles = files || [];
    const newFiles = [...currentFiles, ...selectedFiles].slice(0, 10);
    setValue('files', newFiles);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setValue('files', newFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

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

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(
    null,
  );
  const lastLoadedMessageCreatedAt = useRef<string>('');
  const [chatCreationModalOpened, setChatCreationModalOpened] = useState(false);
  const [chatInfoModalOpened, setChatInfoModalOpened] = useState(false);
  const lastContextMenuChat = useRef<Chat | null>(null);
  const [newMessagesLoading, setNewMessagesLoading] = useState<boolean>(false);
  const [chats, setChats] = useState<Chat[] | null>(null);
  const [chatsLoading, setChatsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [messageContextMenuState, setMessageContextMenuState] =
    useState<MessageContextMenuState | null>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [chatContextMenuState, setChatContextMenuState] =
    useState<ChatContextMenuState | null>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const chatsEndRef = useRef<HTMLDivElement | null>(null);

  const loadingChatsRef = useRef<Set<string>>(new Set());

  const updateParticularChatInChatList = (receivedMessage: Message) => {
    setChats((prevChats) => {
      if (!prevChats) return prevChats;

      const chatExists = prevChats.some(
        (chat) => chat.id === receivedMessage.chatId,
      );

      if (!chatExists) {
        loadAndAddNewChat(receivedMessage.chatId);
        return prevChats;
      }

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

  const loadAndAddNewChat = async (chatId: string) => {
    if (loadingChatsRef.current.has(chatId)) {
      return;
    }

    loadingChatsRef.current.add(chatId);
    try {
      const chatInfo = await fetchChatInfo(chatId);
      if (chatInfo) {
        setChats((prev) => {
          if (!prev) return prev;
          if (prev.some((chat) => chat.id === chatId)) {
            return prev;
          }
          return [chatInfo, ...prev];
        });
      }
    } catch (error) {
      console.error('Failed to load chat info:', error);
    } finally {
      loadingChatsRef.current.delete(chatId);
    }
  };

  const onMessageToUserInChat = (receivedMessage: Message) => {
    setMessages((prev) =>
      prev ? [...prev, receivedMessage] : [receivedMessage],
    );

    updateParticularChatInChatList(receivedMessage);
  };

  const onMessageToUserInServer = (receivedMessage: Message) => {
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

  const onCurrentChatDeleted = (deletedChat: Chat) => {
    setCurrentChat(null);
    onChatDeleted(deletedChat);
  };

  const onChatDeleted = (deletedChat: Chat) => {
    setChats((prevChats) => {
      if (!prevChats) return prevChats;

      return prevChats.filter((chat) => chat.id !== deletedChat.id);
    });
  };

  const onMessageUpdatedInChat = (updatedMessage: Message) => {
    setMessages((prevMessages) => {
      if (!prevMessages) return prevMessages;

      return prevMessages.map((message) => {
        if (message.id === updatedMessage.id) return updatedMessage;
        if (message.replyingMessage?.id === updatedMessage.id) {
          return {
            ...message,
            replyingMessage: {
              ...message.replyingMessage,
              content: updatedMessage.content,
            },
          };
        }
        return message;
      });
    });
  };

  const onMessageUpdatedInServer = (updatedMessage: Message) => {
    setChats((prevChats) => {
      if (!prevChats) return prevChats;

      return prevChats?.map((chat) => {
        if (chat.lastMessageId === updatedMessage.id) {
          return {
            ...chat,
            lastMessageContent: updatedMessage.content,
          };
        }
        return chat;
      });
    });
  };

  const onChatCreated = (createdChat: Chat) => {
    setChats((prevChats) => {
      if (!prevChats) return [createdChat];
      const chatExists = prevChats.some((chat) => chat.id === createdChat.id);
      if (chatExists) return prevChats;

      return [createdChat, ...prevChats];
    });
  };
  const onServerChatUpdated = (updatedChat: Chat) => {
    setChats((prevChats) => {
      if (!prevChats) return prevChats;

      return prevChats.map((chat) => {
        if (chat.id === updatedChat.id) return updatedChat;
        return chat;
      });
    });
  };

  const { send } = useSocket({
    onMessageToUserInChat,
    onMessageToUserInServer,
    onMessageDeleted,
    onCurrentChatDeleted,
    onChatDeleted,
    onMessageUpdatedInChat,
    onMessageUpdatedInServer,
    onChatCreated,
    onServerChatUpdated,
  });

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
    if (currentChat?.id === chatId) return;

    if (currentChat) {
      send({
        event: 'exitChat',
        data: {
          chatId: currentChat.id,
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
    const filesData: {
      buffer: ArrayBuffer;
      originalname: string;
      mimetype: string;
      size: number;
    }[] = [];

    if (files) {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        filesData.push({
          buffer: arrayBuffer,
          originalname: file.name,
          mimetype: file.type,
          size: file.size,
        });
      }
    }

    if (!editingMessage) {
      send({
        event: 'message',
        data: {
          senderId: curProfile.id,
          chatId: currentChat?.id,
          replyToMessageId: replyingMessage?.id,
          content: messageData.content,
          files: filesData,
        },
      });
      setReplyingMessage(null);
    } else {
      send({
        event: 'editMessage',
        data: {
          ...editingMessage,
          content: messageData.content,
          files: filesData,
        },
      });
      setEditingMessage(null);
    }

    reset({ content: '', files: [] });
  };

  const onEditingModeClose = () => {
    setEditingMessage(null);
    reset({ content: '' });
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
        case 'edit':
          if (
            curProfile.id === messageContextMenuState.message.authorProfileId
          ) {
            setEditingMessage(messageContextMenuState?.message);
            reset({ content: messageContextMenuState.message.content });
          }
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
      switch (action) {
        case 'delete':
          send({
            event: 'deleteChat',
            data: {
              chat: chatContextMenuState.chat,
              currentProfileId: curProfile.id,
            },
          });
          break;
        case 'info':
          lastContextMenuChat.current = chatContextMenuState.chat;
          setChatInfoModalOpened(true);
          break;
        case 'leave':
          send({
            event: 'exitChat',
            data: {
              chatId: chatContextMenuState.chat.id,
            },
          });
          leaveChat(chatContextMenuState.chat.id).then((data) => {
            if (data) {
              setErrorModalMessage(data.message);
              setIsErrorModalOpen(true);
            } else {
              setCurrentChat(null);
              if (!chatContextMenuState.chat?.id) return;
              const leftChatId: string = chatContextMenuState.chat.id;
              setChats((prevChats) => {
                if (!prevChats) return prevChats;

                return prevChats.filter((prevChat) => {
                  if (prevChat.id !== leftChatId) return prevChat;
                });
              });
            }
          });
          break;
      }
      setChatContextMenuState(null);
    }
  };

  const loadMoreMessages = async () => {
    if (!currentChat) return;

    const scrollContainer = messagesEndRef.current?.parentElement;
    const oldScrollHeight = scrollContainer?.scrollHeight;

    setNewMessagesLoading(true);
    try {
      const newMessages = await fetchMessagesOfChat(
        lastLoadedMessageCreatedAt.current,
        currentChat.id,
      );

      if (newMessages && newMessages.length > 0) {
        setMessages((prevMessages) => {
          if (!prevMessages) return newMessages;

          //creating set with ids of already created messages
          const existingIds = new Set(prevMessages.map((msg) => msg.id));
          //filtering only new messages
          const uniqueNewMessages = newMessages.filter(
            (msg) => !existingIds.has(msg.id),
          );

          //if there are unique messages -- adding them
          if (uniqueNewMessages.length > 0) {
            lastLoadedMessageCreatedAt.current = uniqueNewMessages[0].createdAt;

            // restoring scroll position after rendering
            setTimeout(() => {
              if (scrollContainer && oldScrollHeight) {
                const newScrollHeight = scrollContainer.scrollHeight;
                scrollContainer.scrollTop = newScrollHeight - oldScrollHeight;
              }
            }, 0);

            //adding old messages to the beginning of an array
            return [...uniqueNewMessages, ...prevMessages];
          }

          return prevMessages;
        });
      }
    } finally {
      setNewMessagesLoading(false);
    }
  };

  const onAddChatButtonClick = () => {
    setChatCreationModalOpened(true);
  };

  const onCreatingChatMenuExitButtonClick = () => {
    setChatCreationModalOpened(false);
  };

  const onChatInfoModalClose = () => {
    setChatInfoModalOpened(false);
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
      setMessages(null);
      fetchMessagesOfChat(currentChat?.lastMessageCreatedAt, currentChat?.id)
        .then((messagesData: Message[] | undefined) => {
          if (!messagesData || messagesData.length === 0) return;
          setMessages(messagesData);
          currentChat.lastMessageRead = MessageReadStatus.READ;
          lastLoadedMessageCreatedAt.current = messagesData[0].createdAt;
        })
        .finally(() => setMessagesLoading(false));
    }
  }, [currentChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorModalMessage}
      />
      <ChatInfoModal
        isOpened={chatInfoModalOpened}
        onClose={onChatInfoModalClose}
        chat={lastContextMenuChat.current}
        currentProfile={curProfile}
      />
      <ChatCreationModal
        currentProfile={curProfile}
        isOpened={chatCreationModalOpened}
        onClose={onCreatingChatMenuExitButtonClick}
      />
      <div
        className={`flex flex-row min-h-screen w-full justify-center items-center`}
      >
        <SidePanel curProfile={curProfile} />
        <div className={`flex w-5/8 h-full justify-center items-center gap-5`}>
          <div
            className={
              'flex flex-col w-1/3 h-full justify-center overflow-y-scroll'
            }
          >
            <div>
              {chatsLoading ? (
                <p>Chats list is loading...</p>
              ) : chats?.length === 0 ? (
                <div
                  className={
                    'flex flex-col gap-2 items-center justify-center w-full'
                  }
                >
                  <p>There are no chats yet.</p>
                  <AddChatButton onAddChatButtonClick={onAddChatButtonClick} />
                </div>
              ) : (
                <div className={'flex flex-col gap-3'}>
                  {chats?.map((chat) => (
                    <div
                      key={chat.id}
                      onContextMenu={(e) => handleChatsContextMenu(e, chat)}
                    >
                      <ChatPreviewTile
                        chat={chat}
                        currentChatId={currentChat?.id}
                        onClick={() => onChatTileClick(chat.id)}
                        onOptionsButtonClick={(e) =>
                          handleChatsContextMenuButton(e, chat)
                        }
                      />
                    </div>
                  ))}
                  <div
                    className={
                      'flex w-full min-h-[25px] items-center justify-center'
                    }
                  >
                    <AddChatButton
                      onAddChatButtonClick={onAddChatButtonClick}
                    />
                  </div>
                </div>
              )}
              <div ref={chatsEndRef} />
            </div>
          </div>
          <div className={`flex flex-col w-5/8 h-screen justify-center gap-2`}>
            <div
              className={`flex w-full h-[800px] border-black border-1 pb-1.5`}
            >
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
                    'flex flex-col w-full h-full overflow-y-auto overflow-x-hidden'
                  }
                >
                  <div className={'flex-1'} />
                  <>
                    {newMessagesLoading ? (
                      <span className={'flex w-full justify-center m-4'}>
                        Loading...
                      </span>
                    ) : (
                      <div className={'flex w-full justify-center m-4'}>
                        <button
                          onClick={() => loadMoreMessages()}
                          className={
                            'min-w-[50px] min-h-[20px] bg-[#eaddff] rounded-2xl cursor-pointer hover:bg-[#B282FF] hover:text-white'
                          }
                        >
                          <span className={'m-3'}>Load more messages</span>
                        </button>
                      </div>
                    )}
                  </>
                  {messages?.map((message) => (
                    <div
                      key={message.id}
                      onContextMenu={(e) =>
                        handleMessagesContextMenu(e, message)
                      }
                    >
                      <MessageTile
                        message={message}
                        currentUserId={curProfile.id}
                      />
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            {!currentChat ? null : (
              <>
                {replyingMessage ? (
                  <ReplyingMessageHint
                    replyingMessage={replyingMessage}
                    setReplyingMessage={setReplyingMessage}
                  />
                ) : editingMessage ? (
                  <EditingMessageHint
                    editingMessage={editingMessage}
                    onClose={onEditingModeClose}
                  />
                ) : null}

                {/*files preview part*/}
                {files && files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 p-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="relative flex items-center gap-2 bg-gray-100 rounded-lg p-2 pr-8"
                      >
                        {/* Images preview */}
                        {file.type.startsWith('image/') ? (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center text-xs">
                            📄
                          </div>
                        )}

                        <span className="text-sm max-w-[100px] truncate">
                          {file.name}
                        </span>

                        {/* Deletion button */}
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {files.length >= 10 && (
                      <span className="text-xs text-gray-500 self-center">
                        10 files max
                      </span>
                    )}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className={
                    'flex flex-row w-min-1/20 border-[#79747e] border-2 rounded-4xl p-2 gap-3 items-center pl-5'
                  }
                >
                  {/* hidden input for files */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={files && files.length >= 10}
                  />

                  <button
                    type={'button'}
                    onClick={openFileDialog}
                    disabled={files && files.length >= 10}
                    className={
                      'flex h-full min-w-[37px] items-center justify-center cursor-pointer'
                    }
                  >
                    <Image
                      src={'/images/icons/clip.svg'}
                      alt={'pin file to message'}
                      height={30}
                      width={30}
                      draggable={false}
                      className={'hover:min-h-[37px] hover:min-w-[37px]'}
                    />
                  </button>
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
          {messageContextMenuState && messageContextMenuState.message && (
            <MessageContextMenu
              menuRef={messageMenuRef}
              contextMenuPosition={messageContextMenuState}
              handleMenuAction={handleMessageMenuAction}
              currentProfileId={curProfile.id}
              messageAuthorId={messageContextMenuState.message.authorProfileId}
            />
          )}
          {chatContextMenuState && (
            <ChatContextMenu
              menuRef={chatMenuRef}
              contextMenuPosition={chatContextMenuState}
              handleMenuAction={handleChatsMenuAction}
              isCurrentProfileAdmin={
                chatContextMenuState.chat?.isCurrentUserAdmin
              }
              chatType={chatContextMenuState.chat?.type}
            />
          )}
        </div>
      </div>
    </>
  );
}
