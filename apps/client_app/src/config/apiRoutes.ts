import '../../next.config';
import { env } from '../env';

export const SERVER = {
  API: {
    GOOGLE_AUTH: `${env.NEXT_PUBLIC_API_URL}/auth/google`,
    LOG_IN: `${env.NEXT_PUBLIC_API_URL}/auth/login`,
    LOG_OUT: `${env.NEXT_PUBLIC_API_URL}/auth/logout`,
    REGISTRATION: `${env.NEXT_PUBLIC_API_URL}/auth/registration`,
    GET_POSTS_OF_SUBSCRIBED_ON: `${env.NEXT_PUBLIC_API_URL}/posts/allOfSubscribedOn`,
    GEL_ALL_POSTS_OF_PROFILE: `${env.NEXT_PUBLIC_API_URL}/posts/allOfProfile/`,
    DELETE_POST: `${env.NEXT_PUBLIC_API_URL}/posts/delete/`,
    GET_CURRENT_PROFILE_INFO: `${env.NEXT_PUBLIC_API_URL}/profiles/info`,
    FOLLOW: `${env.NEXT_PUBLIC_API_URL}i/profiles/follow/`,
    UNFOLLOW: `${env.NEXT_PUBLIC_API_URL}/profiles/unfollow/`,
    CREATE_POST: `${env.NEXT_PUBLIC_API_URL}/posts/create`,
    LIKE_POST: `${env.NEXT_PUBLIC_API_URL}/posts/like/`,
    UNLIKE_POST: `${env.NEXT_PUBLIC_API_URL}/posts/unlike/`,
    EDIT_PROFILE: `${env.NEXT_PUBLIC_API_URL}/profiles/update/`,
    ADD_COMMENT: `${env.NEXT_PUBLIC_API_URL}/comments/add`,
    GET_COMMENTS_OF_POST: `${env.NEXT_PUBLIC_API_URL}/comments/allOfPost/`,
    LIKE_COMMENT: `${env.NEXT_PUBLIC_API_URL}/comments/like/`,
    UNLIKE_COMMENT: `${env.NEXT_PUBLIC_API_URL}i/comments/unlike/`,
    DELETE_COMMENT: `${env.NEXT_PUBLIC_API_URL}/comments/delete/`,
    GET_ALL_COMMENT_RESPONSES: `${env.NEXT_PUBLIC_API_URL}/comments/allResponses/`,
    FETCH_ALL_CHATS_OF_PROFILE: `${env.NEXT_PUBLIC_API_URL}/chat/allChatsOfProfile`,
    FETCH_PRIVATE_CHAT: `${env.NEXT_PUBLIC_API_URL}/chat/findInfoOfPrivate/`,
    CREATE_CHAT: `${env.NEXT_PUBLIC_API_URL}/chat/create`,
    FETCH_CHAT_INFO: `${env.NEXT_PUBLIC_API_URL}/chat/info/`,
    GET_MESSAGES_OF_CHAT: `${env.NEXT_PUBLIC_API_URL}/messages/fromChat/`,
  },
};
