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
  profileId: string;
  birthday: string;
  bio: string;
  avatarFilename?: string;
  isPublic: boolean;
  postsAmount: number;
  subscribersAmount: number;
  subscriptionsAmount: number;
  isSubscribed: boolean;
}
