type Post = {
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

type AssetData = {
  order: number;
  url: string;
};

type CreatePostModalProps = {
  userAvatarUrl?: string;
  username?: string;
  isOpen: boolean;
  onClose: () => void;
};

type EditProfileModalProps = {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
};

type PostPreviewModalProps = {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
};

type Profile = {
  profileId: string;
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

type PostComment = {
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
