"use client";
import { http, createConfig } from "@wagmi/core";
// import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { mainnet, arbitrum } from "@wagmi/core/chains";

export const config = createConfig({
  chains: [mainnet, arbitrum],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ENS_RPC_PROVIDER),
    [arbitrum.id]: http(),
  },
});
