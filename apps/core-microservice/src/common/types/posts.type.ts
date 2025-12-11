import { PostStatus } from 'innogram-client/src/enums';

export interface FoundPostData {
  postId: string;
  profileId: string;
  username: string;
  profileAvatarFilename: string;
  content: string;
  timePast: string;
  likesCount: number;
  status: PostStatus;
}

export interface ReturningPostData {
  postId: string;
  profileId: string;
  profileAvatarUrl?: string;
  username: string;
  content: string;
  timePast: string;
  likesCount: number;
  status: PostStatus;
  liked: boolean;
  assets: ReturningAssetData[];
  isCreator: boolean;
}

export interface ReturningAssetData {
  order: number;
  url?: string;
}
