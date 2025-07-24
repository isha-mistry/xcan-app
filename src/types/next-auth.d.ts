import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    githubId?: string;
    githubUsername?: string;
    accessToken?: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    githubId?: string;
    githubUsername?: string;
    referrer?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubId?: string;
    githubUsername?: string;
    accessToken?: string;
    referrer?: string | null;
  }
}
