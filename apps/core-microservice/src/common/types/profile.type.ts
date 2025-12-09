import { ChatParticipantRole } from '../enums/chat.enum';
import { FollowAcceptedStatus } from '../enums/profile-follow.enum';

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
  subscribedStatus?: FollowAcceptedStatus | null;
}

export interface FindingProfileInfo {
  id: string;
  username: string;
  birthday: string;
  bio: string;
  avatarFilename?: string;
  isPublic: boolean;
  postsAmount: number;
  subscribersAmount: number;
  subscriptionsAmount: number;
  isSubscribed: boolean;
  subscribedStatus?: FollowAcceptedStatus | null;
}

export interface ChatParticipantProfile {
  id: string;
  username: string;
  profileId: string;
  avatarUrl?: string;
  role: ChatParticipantRole;
}
