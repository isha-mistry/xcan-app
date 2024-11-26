// import { useEffect, useState, useCallback, useRef } from 'react';
// import { getAccessToken, usePrivy, useWallets } from "@privy-io/react-auth";
// import { useAccount } from 'wagmi';
// import { debounce } from 'lodash';

// export const useWalletAddress = () => {
//   const [walletAddress, setWalletAddress] = useState<string | null>(null);
//   const [addressSource, setAddressSource] = useState<'external' | 'embedded' | null>(null);
  
//   // Maintain a ref for the current external connection status
//   const externalWalletRef = useRef({
//     isConnected: false,
//     address: null as string | null
//   });
  
//   // Privy hooks
//   const { ready, authenticated, user } = usePrivy();
  
//   // Wagmi hook
//   const { address, isConnected, isConnecting } = useAccount();

//   // Update external wallet ref
//   useEffect(() => {
//     externalWalletRef.current = {
//       isConnected,
//       address: address ?? null
//     };
//   }, [isConnected, address]);

//   // Debounced update function to prevent rapid state changes
//   const debouncedUpdate = useCallback(
//     debounce(() => {
//       // if (!ready) {
//       //   setWalletAddress(null);
//       //   setAddressSource(null);
//       //   return;
//       // }

//       // Clear state if nothing is connected
//       if (!externalWalletRef.current.isConnected && !authenticated) {
//         setWalletAddress(null);
//         setAddressSource(null);
//         return;
//       }

//       // External wallet takes precedence
//       if (externalWalletRef.current.isConnected && externalWalletRef.current.address) {
//         setWalletAddress(externalWalletRef.current.address);
//         setAddressSource('external');
//         return;
//       }

//       // Fall back to embedded wallet only if no external wallet is connected
//       if (authenticated && user?.wallet?.address && !externalWalletRef.current.isConnected) {
//         setWalletAddress(user.wallet.address);
//         setAddressSource('embedded');
//         return;
//       }
//     }, 200),
//     [ready, authenticated, user]
//   );

//   // Handle external wallet changes
//   useEffect(() => {
//     if (ready) {
//       debouncedUpdate();
//     }
    
//     // Cleanup
//     return () => {
//       debouncedUpdate.cancel();
//     };
//   }, [isConnected, address, ready, debouncedUpdate]);

//   // Handle embedded wallet changes
//   useEffect(() => {
//     if (ready) {
//       debouncedUpdate();
//     }
//   }, [authenticated, user, ready, debouncedUpdate]);

//   return {
//     walletAddress,
//     addressSource,
//     isLoading: !ready || isConnecting,
//     isConnected: Boolean(walletAddress),
//     // Additional helper methods
//     isExternalWallet: addressSource === 'external',
//     isEmbeddedWallet: addressSource === 'embedded'
//   };
// };

// Usage example:
// const Example = () => {
//   const { 
//     walletAddress, 
//     addressSource,
//     isLoading,
//     isConnected,
//     isExternalWallet,
//     isEmbeddedWallet
//   } = useWalletAddress();

//   if (isLoading) return <div>Loading...</div>;

//   return (
//     <div>
//       {isConnected && (
//         <div>
//           <div>Address: {walletAddress}</div>
//           <div>
//             Connected with: {isExternalWallet ? 'External Wallet' : 'Embedded Wallet'}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// import { useEffect, useState, useCallback, useRef } from 'react';
// import { getAccessToken, usePrivy, useWallets } from "@privy-io/react-auth";
// import { useAccount } from 'wagmi';
// import { debounce } from 'lodash';

// export const useWalletAddress = () => {
//   const [walletAddress, setWalletAddress] = useState<string | null>(null);
//   const [addressSource, setAddressSource] = useState<'external' | 'embedded' | null>(null);
  
//   // Store the last valid wallet address
//   const lastValidWalletRef = useRef<{
//     address: string | null;
//     source: 'external' | 'embedded' | null;
//   }>({
//     address: null,
//     source: null
//   });
  
//   // Maintain a ref for the current external connection status
//   const externalWalletRef = useRef({
//     isConnected: false,
//     address: null as string | null
//   });
  
//   // Privy hooks
//   const { ready, authenticated, user } = usePrivy();
  
//   // Wagmi hook
//   const { address, isConnected, isConnecting } = useAccount();

//   // Update external wallet ref
//   useEffect(() => {
//     externalWalletRef.current = {
//       isConnected,
//       address: address ?? null
//     };
//   }, [isConnected, address]);

//   // Debounced update function to prevent rapid state changes
//   const debouncedUpdate = useCallback(
//     debounce(() => {
//       if (!ready) return;

//       let newAddress: string | null = null;
//       let newSource: 'external' | 'embedded' | null = null;

//       // External wallet takes precedence
//       if (externalWalletRef.current.isConnected && externalWalletRef.current.address) {
//         newAddress = externalWalletRef.current.address;
//         newSource = 'external';
//       } 
//       // Fall back to embedded wallet only if no external wallet is connected
//       else if (authenticated && user?.wallet?.address && !externalWalletRef.current.isConnected) {
//         newAddress = user.wallet.address;
//         newSource = 'embedded';
//       }

//       // If we have a new valid wallet, update state
//       if (newAddress && newSource) {
//         lastValidWalletRef.current = { address: newAddress, source: newSource };
//         setWalletAddress(newAddress);
//         setAddressSource(newSource);
//       } 
//       // Only clear state if both wallets are definitely disconnected
//       else if (!externalWalletRef.current.isConnected && !authenticated) {
//         lastValidWalletRef.current = { address: null, source: null };
//         setWalletAddress(null);
//         setAddressSource(null);
//       } 
//       // If in transition, use last valid wallet
//       else if (lastValidWalletRef.current.address) {
//         setWalletAddress(lastValidWalletRef.current.address);
//         setAddressSource(lastValidWalletRef.current.source);
//       }
//     }, 200),
//     [ready, authenticated, user]
//   );

//   // Handle external wallet changes
//   useEffect(() => {
//     if (ready) {
//       debouncedUpdate();
//     }
    
//     return () => {
//       debouncedUpdate.cancel();
//     };
//   }, [isConnected, address, ready, debouncedUpdate]);

//   // Handle embedded wallet changes
//   useEffect(() => {
//     if (ready) {
//       debouncedUpdate();
//     }
//   }, [authenticated, user, ready, debouncedUpdate]);

//   return {
//     walletAddress,
//     addressSource,
//     isLoading: !ready || isConnecting,
//     isConnected: Boolean(walletAddress),
//     // Additional helper methods
//     isExternalWallet: addressSource === 'external',
//     isEmbeddedWallet: addressSource === 'embedded'
//   };
// };

// import { useEffect, useState, useCallback } from 'react';
// import { usePrivy } from "@privy-io/react-auth";
// import { useAccount } from 'wagmi';

// interface WalletAddressHook {
//   walletAddress: string | null;
//   addressSource: 'external' | 'embedded' | null;
//   isLoading: boolean;
//   isConnected: boolean;
//   isExternalWallet: boolean;
//   isEmbeddedWallet: boolean;
// }

// export const useWalletAddress = (): WalletAddressHook => {
//   // Use localStorage as a fallback mechanism
//   const getStoredWalletAddress = (): string | null => {
//     try {
//       return localStorage.getItem('persistentWalletAddress');
//     } catch (error) {
//       console.error('Error accessing localStorage:', error);
//       return null;
//     }
//   };

//   const [walletAddress, setWalletAddress] = useState<string | null>(
//     getStoredWalletAddress()
//   );
//   const [addressSource, setAddressSource] = useState<'external' | 'embedded' | null>(
//     localStorage.getItem('addressSource') as 'external' | 'embedded' | null
//   );
//   const [isLoading, setIsLoading] = useState(true);

//   // Privy hooks
//   const { ready, authenticated, user } = usePrivy();
  
//   // Wagmi hook
//   const { address, isConnected } = useAccount();

//   // Persist wallet address to localStorage
//   const persistWalletAddress = useCallback((address: string | null, source: 'external' | 'embedded' | null) => {
//     try {
//       if (address) {
//         localStorage.setItem('persistentWalletAddress', address);
//         localStorage.setItem('addressSource', source || '');
//       } else {
//         localStorage.removeItem('persistentWalletAddress');
//         localStorage.removeItem('addressSource');
//       }
//     } catch (error) {
//       console.error('Error storing wallet address:', error);
//     }
//   }, []);

//   useEffect(() => {
//     // Determine loading state
//     setIsLoading(!ready);

//     // Prioritize external wallet (wagmi)
//     if (isConnected && address) {
//       setWalletAddress(address);
//       setAddressSource('external');
//       persistWalletAddress(address, 'external');
//       return;
//     }

//     // Fall back to embedded wallet
//     if (authenticated && user?.wallet?.address) {
//       setWalletAddress(user.wallet.address);
//       setAddressSource('embedded');
//       persistWalletAddress(user.wallet.address, 'embedded');
//       return;
//     }

//     // If no wallet is connected but we have a stored address
//     const storedAddress = getStoredWalletAddress();
//     if (storedAddress && ready) {
//       setWalletAddress(storedAddress);
//       setAddressSource(localStorage.getItem('addressSource') as 'external' | 'embedded');
//       return;
//     }

//     // If no wallet is connected
//     if (ready) {
//       setWalletAddress(null);
//       setAddressSource(null);
//       persistWalletAddress(null, null);
//     }
//   }, [ready, authenticated, user, isConnected, address, persistWalletAddress]);


//   return {
//     walletAddress,
//     addressSource,
//     isLoading,
//     isConnected: Boolean(walletAddress),
//     isExternalWallet: addressSource === 'external',
//     isEmbeddedWallet: addressSource === 'embedded',
//   };
// };

import { useEffect, useState, useCallback } from 'react';
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { useAccount } from 'wagmi';

interface WalletAddressHook {
  walletAddress: string | null;
  addressSource: 'external' | 'embedded' | null;
  isLoading: boolean;
  isConnected: boolean;
  isExternalWallet: boolean;
  isEmbeddedWallet: boolean;
}

// Safely check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

// Safe localStorage wrapper
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (isLocalStorageAvailable()) {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    }
  }
};

export const useWalletAddress = (): WalletAddressHook => {
  // Safe method to get stored wallet address
  const getStoredWalletAddress = (): string | null => {
    return safeLocalStorage.getItem('persistentWalletAddress');
  };

  // Initialize state with null or stored value, ensuring it works on both server and client
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    // This ensures the initial state is set only on the client side
    return typeof window !== 'undefined' 
      ? getStoredWalletAddress() 
      : null;
  });

  const [addressSource, setAddressSource] = useState<'external' | 'embedded' | null>(() => {
    return typeof window !== 'undefined'
      ? safeLocalStorage.getItem('addressSource') as 'external' | 'embedded' | null
      : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Privy hooks
  const { ready, authenticated, user } = usePrivy();
  
  // Wagmi hook
  const { address, isConnected } = useAccount();

  // Persist wallet address safely
  const persistWalletAddress = useCallback((address: string | null, source: 'external' | 'embedded' | null) => {
    if (address) {
      safeLocalStorage.setItem('persistentWalletAddress', address);
      safeLocalStorage.setItem('addressSource', source || '');
    } else {
      safeLocalStorage.removeItem('persistentWalletAddress');
      safeLocalStorage.removeItem('addressSource');
    }
  }, []);

  useEffect(() => {
    // Ensure this only runs on the client side
    if (typeof window === 'undefined') return;

    // Determine loading state
    setIsLoading(!ready);

    // Prioritize external wallet (wagmi)
    if (isConnected && address) {
      setWalletAddress(address);
      setAddressSource('external');
      persistWalletAddress(address, 'external');
      return;
    }

    // Fall back to embedded wallet
    if (authenticated && user?.wallet?.address) {
      setWalletAddress(user.wallet.address);
      setAddressSource('embedded');
      persistWalletAddress(user.wallet.address, 'embedded');
      return;
    }

    // If no wallet is connected but we have a stored address
    const storedAddress = getStoredWalletAddress();
    if (storedAddress && ready) {
      setWalletAddress(storedAddress);
      setAddressSource(safeLocalStorage.getItem('addressSource') as 'external' | 'embedded');
      return;
    }

    // If no wallet is connected
    if (ready) {
      setWalletAddress(null);
      setAddressSource(null);
      persistWalletAddress(null, null);
    }
  }, [ready, authenticated, user, isConnected, address, persistWalletAddress]);

  return {
    walletAddress,
    addressSource,
    isLoading,
    isConnected: Boolean(walletAddress),
    isExternalWallet: addressSource === 'external',
    isEmbeddedWallet: addressSource === 'embedded'
  };
};