export interface ReturningProfileInfo {
  id: string;
  username: string;
  birthday: string;
  bio: string;
  avatarUrl?: string;
  isPublic: boolean;
  postsAmount: number;
  subscribersAmount: number;
  subscriptionsAmount: number;
  isCurrent: boolean;
  isSubscribed: boolean;
}

export interface FindingProfileInfoById {
  username: string;
  birthday: string;
  bio: string;
  avatarFilename?: string;
  isPublic: boolean;
  postsAmount: number;
  subscribersAmount: number;
  subscriptionsAmount: number;
  isSubscribed: boolean;
}

export interface FindingProfileInfoByUsername {
  id: string;
  birthday: string;
  bio: string;
  avatarFilename?: string;
  isPublic: boolean;
  postsAmount: number;
  subscribersAmount: number;
  subscriptionsAmount: number;
  isSubscribed: boolean;
}
