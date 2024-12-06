import { createWalletClient, createPublicClient, custom, http } from "viem";
import { optimism, arbitrum } from "viem/chains";
import { useAccount } from "wagmi";

declare global {
  interface Window {
    ethereum?: any;
    privy?: any; // Declare privy as a possible Web3 provider
  }
}

const WalletAndPublicClient = () => {
  let publicClient: any = null;
  let walletClient: any = null;
  let chainConfig: any = null;

  const { chain } = useAccount();


  // Map chain name to the corresponding Viem chain configuration
  if (chain?.name === "OP Mainnet") {
    chainConfig = optimism;
  } else if (chain?.name === "Arbitrum One") {
    chainConfig = arbitrum;
  } else {
    console.error("Unsupported chain detected:", chain?.name);
    return { publicClient, walletClient };
  }


  if (typeof window !== "undefined" && (window.ethereum || window.privy)) {
    const provider = window.ethereum; // Use Privy if available, fallback to Ethereum

    try {
      // Create public and wallet clients
      publicClient = createPublicClient({
        chain: chainConfig,
        transport: http(),
      });
      walletClient = createWalletClient({
        chain: chainConfig,
        transport: http()
      });
      
    } catch (error) {
      console.error("Error creating clients:", error);
    }
  } else {
    console.error("No Web3 provider available in window object.");
  }

  return { publicClient, walletClient };
};

export default WalletAndPublicClient;
