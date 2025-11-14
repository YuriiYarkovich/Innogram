export interface RedisSessionData {
  refreshToken: string;
  email: string;
  role: string;
}

export interface RedisNote {
  role: string;
  key: string;
}
