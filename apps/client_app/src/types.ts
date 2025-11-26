export type Post = {
  postId: string;
  profileId: string;
  profileAvatarUrl?: string;
  username: string;
  content: string;
  timePast: string;
  likesCount: number;
  liked: boolean;
  assets: AssetData[];
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
  lastMessageContent?: string;
  lastMessageCreatedAt?: string;
  lastMessageRead?: boolean;
};

export enum ChatTypes {
  PRIVATE = 'private',
  GROUP = 'group',
}

export type Message = {
  id: string;
  chatId: string;
  authorUsername: string;
  authorAvatarUrl: string;
  content: string;
  createdAt: string;
  messageAssetsUrls: string[];
};
