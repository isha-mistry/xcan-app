// types/dashboard.ts
export interface SocialHandles {
  githubUsername?: string;
  githubConnectedAt?: string;
  twitterUsername?: string;
  twitterConnectedAt?: string;
  discordUsername?: string;
  discordConnectedAt?: string;
  telegramUsername?: string;
  telegramConnectedAt?: string;
}

export interface User {
  _id: string;
  address: string;
  isEmailVisible: boolean;
  createdAt: string;
  socialHandles: SocialHandles;
}

export interface MintedLevel {
  level: number;
  levelKey: string;
  levelName: string;
  transactionHash: string;
  metadataUrl: string;
  imageUrl: string;
  mintedAt: string;
  network: string;
}

export interface NFT {
  _id: string;
  userAddress: string;
  githubUsername: string;
  lastMintedAt: string;
  mintedLevels: MintedLevel[];
  totalMinted: number;
}

export interface DashboardUser extends User {
  nftData: NFT | null;
  totalNftsMinted: number;
  connectedSocials: {
    github: boolean;
    twitter: boolean;
    discord: boolean;
    telegram: boolean;
  };
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardUser[];
  count: number;
  totalNftsMinted: number;
  totalNftsMintedForUsers?: number;
}
