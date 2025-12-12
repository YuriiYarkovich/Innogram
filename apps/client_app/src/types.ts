import {
  ChatParticipantRole,
  ChatStatus,
  FollowAcceptedStatus,
  MessageReadStatus,
  MessageVisibilityStatus,
  PostStatus,
} from '@/enums';

export type Post = {
  postId: string;
  profileId: string;
  profileAvatarUrl?: string;
  username: string;
  content: string;
  timePast: string;
  createdAt: string;
  likesCount: number;
  liked: boolean;
  assets: AssetData[];
  status: PostStatus;
  isCreator: boolean;
};

export type AssetData = {
  order: number;
  url: string;
};

export type CreatePostModalProps = {
  userAvatarUrl?: string;
  username?: string;
  isOpen: boolean;
  onClose: () => void;
};

export type EditProfileModalProps = {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
};

export type PostPreviewModalProps = {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
};

export type Profile = {
  id: string;
  username: string;
  birthday: string;
  bio: string;
  avatarUrl: string;
  isPublic: boolean;
  postsAmount: number;
  subscribersAmount: number;
  subscriptionsAmount: number;
  isCurrent: boolean;
  isSubscribed: boolean;
  subscribedStatus?: FollowAcceptedStatus | null;
};

export type SubscriptionRequest = {
  id: string;
  status: FollowAcceptedStatus;
  followerProfileId: string;
  followerProfileUsername: string;
  followerProfileAvatarUrl?: string;
};

export type PostComment = {
  commentId: string;
  authorUsername: string;
  authorAvatarUrl: string;
  commentContent: string;
  likesAmount: number;
  timePast: string;
  liked: boolean;
  isAuthor: boolean;
  parentCommentId?: string;
  responsesAmount: number;
};

export type Chat = {
  id: string;
  avatarUrl?: string;
  title: string;
  type: ChatTypes;
  participantsAmount: number;
  lastMessageId?: string;
  lastMessageContent?: string;
  lastMessageCreatedAt?: string;
  lastMessageRead?: MessageReadStatus;
  chatStatus: ChatStatus;
  isCurrentUserAdmin?: boolean;
};

export type ChatParticipantProfile = {
  id: string;
  username: string;
  profileId: string;
  avatarUrl?: string;
  role: ChatParticipantRole;
};

export enum ChatTypes {
  PRIVATE = 'private',
  GROUP = 'group',
}

export type Message = {
  id: string;
  replyingMessage?: ReplyingMessage;
  chatId: string;
  authorProfileId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
  messageAssets?: { url: string | undefined; order: number }[];
  read: MessageReadStatus;
  isEdited: boolean;
};

export type ReplyingMessage = {
  id: string;
  chatId: string;
  authorUsername: string;
  content: string;
  visibleStatus: MessageVisibilityStatus;
};
