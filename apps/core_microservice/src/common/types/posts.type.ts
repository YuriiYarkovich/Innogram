import { PostStatus } from '../enums/post.enum';

export interface FoundPostData {
  postId: string;
  profileId: string;
  username: string;
  profileAvatarFilename: string;
  content: string;
  timePast: string;
  createdAt: string;
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
  createdAt: string;
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
