import { isAddress } from "viem";
import { cache } from "react";
import { truncateAddress } from "./text";
import { ethers } from "ethers";
import { getEnsAvatar } from "@wagmi/core";
import { getEnsName } from "@wagmi/core";
import { getEnsAddress } from '@wagmi/core'
import { config } from "./config";
import { normalize } from "viem/ens";
import { mainnet } from "@wagmi/core/chains";
import { IMAGE_URL } from "@/config/staticDataUtils";

const provider = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_ENS_RPC_PROVIDER
);

export async function resolveENSProfileImage(
  address: string
): Promise<string | null> {
  const lowerCaseAddress = address.toLowerCase();

  // Return unless the address is a valid ENS name.
  // Basic detection for strings that start with 0x
  const pattern = /^0x[a-fA-F0-9]+/;
  if (pattern.test(address)) {
    return null;
  }

  try {
    return lowerCaseAddress;
  } catch (error) {
    console.error("ENS Avatar error", error);
    return null;
  }
}

export async function processAddressOrEnsName(addressOrENSName: string) {
  // Assume resolved ens name
  if (!isAddress(addressOrENSName)) {
    return addressOrENSName;
  }

  try {
    return truncateAddress(addressOrENSName);
  } catch (error) {
    console.error("Error in reverse resolving ENS name:", error);
    return null;
  }
}

export async function getMetaAddressOrEnsName(
  daoName: string,
  address: string
) {
  // const res = await fetch(
  //   `https://api.karmahq.xyz/api/dao/find-delegate?dao=${daoName}&user=${address}`
  // );
  // const details = await res.json();
  const fetchedEnsName = await fetchEnsName(address);
  // const karmaEnsName = details.data.delegate?.ensName;
  const ensName = fetchedEnsName?.ensName;
  return ensName ? ensName : truncateAddress(address);
}

export async function getMetaProfileImage() {}

export async function fetchEnsNameAndAvatar(address: any) {
  try {
    const ensName = await getEnsName(config, {
      address,
      chainId: mainnet.id,
    });
    const avatar = await getEnsAvatar(config, {
      assetGatewayUrls: {
        ipfs: "https://cloudflare-ipfs.com",
      },
      gatewayUrls: ["https://cloudflare-ipfs.com"],
      name: normalize(ensName?.toString() || ""),
      chainId: mainnet.id,
      // universalResolverAddress: "0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376",
    });
    return { avatar, ensName };
  } catch (error) {
    const truncatedAddress = truncateAddress(address);
    console.error(`Error fetching ENS details for address ${address}:`, error);
    return { avatar: null, ensName: truncatedAddress };
  }
}
export async function fetchEnsAddress(ensName: any) {
  const ensAddress = getEnsAddress(config, {
    name: normalize(ensName),
  })
  return ensAddress;
}

export async function fetchEnsName(address: any) {
  try {
    const ensName = await getEnsName(config, {
      address,
      chainId: mainnet.id,
    });
    // console.log("ensName: ", ensName);
    const displayName = address?.slice(0, 4) + "..." + address?.slice(-4);

    const ensNameOrAddress = ensName ? ensName : displayName;

    return { ensNameOrAddress, ensName };
  } catch (e) {
    console.log("Error in fetchEnsName ", e);
    const truncatedAddress = truncateAddress(address);
    return { ensNameOrAddress: truncatedAddress, ensName: truncatedAddress };
  }
}

export async function getENSName(address: string): Promise<string | null> {
  const provider = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_ENS_RPC_PROVIDER
  );

  try {
    const ensName = await provider.lookupAddress(address);
    return ensName;
  } catch (error) {
    console.error("Error fetching ENS name:", error);
    return null;
  }
}


export async function getMetadataEnsData(address: string) {
  try {
    if (!address || !address.startsWith('0x')) {
      return { 
        name: null, 
        avatar: null,
        formattedAddress: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'
      };
    }

    // For ethers v6
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com'
    );

    // Get ENS name
    const ensName = await provider.lookupAddress(address);
    
    // Format address for display if no ENS name
    const formattedAddress = ensName || `${address.slice(0, 6)}...${address.slice(-4)}`;
    
    let avatar = null;
    // We'll just use the name for now since avatar resolution is more complex in v6
    
    return {
      name: ensName,
      avatar: null,
      formattedAddress
    };
  } catch (error) {
    console.error("Error fetching ENS data for metadata:", error);
    return { 
      name: null, 
      avatar: null,
      formattedAddress: `${address.slice(0, 6)}...${address.slice(-4)}`
    };
  }
}


export async function getEnsAvatarUrl(address: string): Promise<string | null> {
  try {
    // First check if the address is valid
    if (!address || !address.startsWith('0x')) {
      console.log('Invalid address format:', address);
      return null;
    }

    // Create provider instance
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ENS_RPC_PROVIDER || 'https://eth.llamarpc.com'
    );

    // First get the ENS name for the address
    const ensName = await provider.lookupAddress(address);
    
    // If no ENS name found, return null early
    if (!ensName) {
      console.log(`No ENS name found for address: ${address}`);
      return null;
    }

    console.log(`Found ENS name: ${ensName} for address: ${address}`);

    // Now that we have a valid ENS name, we can resolve the avatar
    const resolver = await provider.getResolver(ensName);
    if (!resolver) {
      console.log(`No resolver found for ENS name: ${ensName}`);
      return null;
    }

    // Get the avatar text record
    const avatar = await resolver.getText('avatar');
    
    // If no avatar is set, return null
    if (!avatar) {
      console.log(`No avatar found for ENS name: ${ensName}`);
      return null;
    }

    console.log(`Found avatar for ${ensName}:`, avatar);

    // Process IPFS URLs to use a gateway
    if (avatar.startsWith('ipfs://')) {
      const ipfsHash = avatar.replace('ipfs://', '');
      return `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`;
    }

    if (avatar.includes('/ipfs/')) {
      // Extract the IPFS hash from the URL
      const ipfsHashMatch = avatar.match(/\/ipfs\/([a-zA-Z0-9]+)/);
      if (ipfsHashMatch && ipfsHashMatch[1]) {
        // Use a different gateway
        return `https://ipfs.io/ipfs/${ipfsHashMatch[1]}`;
      }
    }

    if (avatar.startsWith('eip155:')) {
      console.log(`Found NFT avatar URL: ${avatar}`);
      // For NFT avatars, you might want to convert them to actual image URLs
      // This is complex and might require additional API calls
      return IMAGE_URL; 
    }
    
    // Handle data URLs (rare but possible)
    if (avatar.startsWith('data:')) {
      return avatar;
    }
    
    // Handle HTTP/HTTPS URLs
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      if (avatar.includes('cloudflare-ipfs.com')) {
        const ipfsHashMatch = avatar.match(/\/ipfs\/([a-zA-Z0-9]+)/);
        if (ipfsHashMatch && ipfsHashMatch[1]) {
          return `https://ipfs.io/ipfs/${ipfsHashMatch[1]}`;
        }
      }
      return avatar;
    }
    
    // For any other format, log and return as is
    console.log(`Avatar URL in unknown format: ${avatar}`);
    return avatar;
  } catch (error) {
    console.error(`Error fetching ENS avatar for address ${address}:`, error);
    return null;
  }
}