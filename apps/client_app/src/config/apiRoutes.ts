import '../../next.config';

export const SERVER = {
  API: {
    GOOGLE_AUTH: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/google`,
    LOG_IN: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/login`,
    LOG_OUT: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/logout`,
    REGISTRATION: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/registration`,
    GET_POSTS_OF_SUBSCRIBED_ON: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts/allOfSubscribedOn`,
    GEL_ALL_POSTS_OF_PROFILE: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts/allOfProfile/`,
    DELETE_POST: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts/delete/`,
    GET_CURRENT_PROFILE_INFO: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/profiles/info`,
    FOLLOW: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/profiles/follow/`,
    UNFOLLOW: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/profiles/unfollow/`,
    CREATE_POST: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts/create`,
    LIKE_POST: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts/like/`,
    UNLIKE_POST: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts/unlike/`,
    EDIT_PROFILE: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/profiles/update/`,
    ADD_COMMENT: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/comments/add`,
    GET_COMMENTS_OF_POST: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/comments/allOfPost/`,
    LIKE_COMMENT: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/comments/like/`,
    UNLIKE_COMMENT: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/comments/unlike/`,
    DELETE_COMMENT: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/comments/delete/`,
    GET_ALL_COMMENT_RESPONSES: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/comments/allResponses/`,
  },
};
