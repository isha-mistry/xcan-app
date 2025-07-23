// types/dashboard.ts
export interface SocialHandles {
  githubId?: string;
  githubUsername?: string;
  twitterId?: string;
  twitterUsername?: string;
  discordId?: string;
  discordUsername?: string;
  telegramId?: string;
  telegramUsername?: string;
}

export interface User {
  _id: string;
  address: string;
  isEmailVisible: boolean;
  createdAt: string;
  image: string | null;
  displayName: string | null;
  description: string | null;
  emailId: string | null;
  socialHandles: SocialHandles;
  referrer: string | null;
}

export interface NFT {
  userAddress: string;
  transactionHash: string;
  metadataUrl: string;
  imageUrl: string;
  mintedAt: string;
  network: string;
}

export interface DashboardUser extends User {
  nfts: NFT[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardUser[];
  count: number;
}