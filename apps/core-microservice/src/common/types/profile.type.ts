export interface ReturningProfileInfo {
  profileId: string;
  username: string;
  birthday: string;
  bio: string;
  avatarUrl?: string;
  isPublic: boolean;
  postsAmount: number;
  subscribersAmount: number;
  subscriptionsAmount: number;
}

export interface FindingProfileInfo {
  username: string;
  birthday: string;
  bio: string;
  avatarFileName?: string;
  isPublic: boolean;
  postsAmount: number;
  subscribersAmount: number;
  subscriptionsAmount: number;
}
