import { PrivyClient } from "@privy-io/server-auth";

let privyClient: PrivyClient | null = null;

export function getPrivyClient(): PrivyClient {
  if (privyClient) return privyClient;

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const secret = process.env.PRIVY_SECRET;

  if (!appId || !secret) {
    throw new Error("Missing Privy env vars: NEXT_PUBLIC_PRIVY_APP_ID/PRIVY_SECRET");
  }

  privyClient = new PrivyClient(appId, secret);
  return privyClient;
}
