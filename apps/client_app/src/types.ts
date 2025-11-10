type PostTileProps = {
  postId?: string;
  avatarUrl?: string;
  username?: string;
  timePast?: string;
  contentUrl?: string;
  likesCount?: number;
  postContent?: string;
  liked?: boolean;
};

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
};
