export interface ReturningCommentData {
  commentId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  commentContent: string;
  likesAmount: number;
  timePast: string;
  liked: boolean;
  isAuthor: boolean;
  parentCommentId?: string;
  responsesAmount: number;
}

export interface FindingCommentData {
  commentId: string;
  authorProfileId: string;
  authorUsername: string;
  authorAvatarFilename: string;
  commentContent: string;
  likesAmount: number;
  timePast: string;
  parentCommentId: string;
}
