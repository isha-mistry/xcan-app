import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { BASE_URL } from "@/config/constants";
import jwt from "jsonwebtoken";

async function AccountCreate(
  githubId: string,
  githubUsername: string,
  token: any,
  referrer: string | null
) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/accountcreate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        isEmailVisible: false,
        createdAt: new Date(),
        referrer: referrer,
        githubId,
        githubUsername,
      }),
    });
    if (res.status === 200) {
      // Account created successfully!
    } else if (res.status === 409) {
      // Resource already exists!
    } else {
      console.log("Unexpected response:", await res.text());
    }
  } catch (error) {
    console.error("Error in initial profile:", error);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user, profile }) {
      if (account && profile) {
        // Create a new JWT access token
        const accessToken = jwt.sign(
          {
            sub: profile.id,
            githubId: profile.id,
            githubUsername: profile.login,
          },
          process.env.NEXTAUTH_SECRET!,
          { expiresIn: "10m" }
        );
        AccountCreate(profile.id, profile.login, accessToken, null);
        token.accessToken = accessToken;
        token.githubId = profile.id;
        token.githubUsername = profile.login;
      }
      return token;
    },
    async session({ session, token }) {
      session.githubId = token.githubId;
      session.githubUsername = token.githubUsername;
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
