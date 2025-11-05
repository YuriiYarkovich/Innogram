export interface FoundPostData {
  postId: string;
  profileId: string;
  username: string;
  content: string;
  timePast: string;
  likesCount: number;
}

export interface ReturningPostData {
  postId: string;
  profileId: string;
  profileAvatarUrl?: string;
  username: string;
  content: string;
  timePast: string;
  likesCount: number;
  assets: ReturningAssetData[];
}

export interface ReturningAssetData {
  order: number;
  url: string;
}
