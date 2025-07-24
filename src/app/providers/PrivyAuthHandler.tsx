import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BASE_URL } from "@/config/constants";

// Helper function to handle referrer storage
const handleReferrerStorage = (referrer: string | null) => {
  if (referrer && typeof window !== "undefined") {
    sessionStorage.setItem("referrer", referrer);
  }
};

export function PrivyAuthHandler() {
  const { user, ready, getAccessToken } = usePrivy();
  const searchParams = useSearchParams();
  const [referrer, setReferrer] = useState<string | null>(null);

  // Handle referrer on mount and when searchParams change
  useEffect(() => {
    const referrerFromURL = searchParams.get("referrer");
    const storedReferrer = sessionStorage.getItem("referrer");

    const finalReferrer = referrerFromURL || storedReferrer;
    if (finalReferrer) {
      setReferrer(finalReferrer);
      handleReferrerStorage(finalReferrer);
    }
  }, [searchParams, referrer]);

  useEffect(() => {
    const handleUserLogin = async () => {
      if (!ready || !user) return;
      try {
        const token = await getAccessToken();
        const referrer = searchParams.get("referrer");
        // Get GitHub info from user object
        const githubAccount = user.linkedAccounts.find(account => account.type === "github_oauth");
        if (!githubAccount) {
          // Not logged in with GitHub
          return;
        }
        const githubInfo = {
          id: githubAccount.subject,
          username: githubAccount.username || githubAccount.name || ""
        };
        await createOrVerifyAccount(token, referrer, githubInfo);
      } catch (error) {
        console.error("Error handling user login:", error);
      }
    };
    handleUserLogin();
  }, [user, ready]);

  return null;
}

// Updated createOrVerifyAccount function for GitHub only
async function createOrVerifyAccount(
  token: string | null,
  referrer: string | null,
  githubInfo: { id: string; username: string }
) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/accountcreate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        isEmailVisible: false,
        createdAt: new Date(),
        referrer: referrer,
        githubId: githubInfo.id,
        githubUsername: githubInfo.username,
      }),
    });
    const responseText = await response.text();
    if (response.status === 200) {
      // Account created successfully
    } else if (response.status === 409) {
      // Account already exists
    } else {
      throw new Error(`Failed to create/verify account: ${responseText}`);
    }
  } catch (error) {
    console.error("Error creating/verifying account:", error);
    throw error;
  }
}
