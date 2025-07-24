// Deprecated: Wallet logic removed for GitHub-only authentication
export const useWalletAddress = () => {
  return {
    walletAddress: null,
    addressSource: null,
    isLoading: false,
    isConnected: false,
    isExternalWallet: false,
    isEmbeddedWallet: false,
  };
};
