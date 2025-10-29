export interface Account {
  id: string;
  userId: string;
  email: string;
  provider: string;
}

export interface AccountWithProfileId {
  id: string;
  email: string;
  passwordHash: string | null;
  userId: string;
  role: string;
  profileId: string;
}

export interface ExistingAccount {
  isExist: boolean;
  account: AccountWithProfileId | undefined;
}
