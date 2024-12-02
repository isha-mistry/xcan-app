  "use client";

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