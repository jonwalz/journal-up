export interface IUserInfo {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bio: string | null | undefined;
  timezone: string;
  growthGoals: {
    shortTerm: string[];
    longTerm: string[];
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserInfo {
  userId: string;
  firstName: string;
  lastName: string;
  bio?: string;
  timezone?: string;
  growthGoals?: {
    shortTerm: string[];
    longTerm: string[];
  };
}

export interface IUpdateUserInfo {
  firstName?: string;
  lastName?: string;
  bio?: string;
  timezone?: string;
  growthGoals?: {
    shortTerm: string[];
    longTerm: string[];
  };
}
