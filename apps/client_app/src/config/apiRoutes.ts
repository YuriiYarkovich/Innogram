import '../../next.config';

export const CONFIG = {
  BACKEND_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  API: {
    GOOGLE_AUTH: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/google`,
    LOG_IN: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/login`,
    REGISTRATION: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/registration`,
    GET_POSTS_OF_SUBSCRIBED_ON: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts/allOfSubscribedOn`,
    GEL_ALL_POSTS_OF_PROFILE: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts/allOfProfile/`,
    GET_CURRENT_PROFILE_INFO: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/profiles/info`,
    CREATE_POST: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts/create`,
    LIKE_POST: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts/like/`,
    UNLIKE_POST: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts/unlike/`,
    EDIT_PROFILE: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/profiles/update/`,
  },
};
