"use client";
import React, { useEffect, useState } from "react";
import { fetchEnsNameAndAvatar, fetchEnsName } from "@/utils/ENSUtils";
import { BiSolidWallet } from "react-icons/bi";
import user2 from "@/assets/images/user/user2.svg";
import { getAccessToken, usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import ChainSwitcherHeader from "./ChainSwitcherHeader";
import MobileChainSwitcher from "./MobileChainSwitcher";
import { fetchApi } from "@/utils/api";
import toast, { Toaster } from "react-hot-toast";
import { disconnect } from "process";
import { Wallet } from "lucide-react";

interface GTMEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

function ConnectWalletWithENS() {
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);
  const { address, isConnected, isConnecting, isDisconnected, chain } =
    useAccount();
  const chainId = useChainId();
  const { chains, error: switchNetworkError, switchChain } = useSwitchChain();
  const [walletAddress2, setWalletAddress] = useState<string | null>(null);
  const { ready, authenticated, login, logout, user, connectWallet } =
    usePrivy();
  const { wallets } = useWallets();
  const activeWallet = wallets[0]; // Primary wallet

  const pushToGTM = (eventData: GTMEvent) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(eventData);
    }
  };

  useEffect(() => {

    if (isDisconnected && !authenticated) {
      window.walletAuthTracked = false;
    }
    
    if (isConnected && address) {
      setWalletAddress(address); // External wallet address
      if (authenticated && !window.walletAuthTracked) {
        window.walletAuthTracked = true; // Set flag to prevent duplicate tracking
        pushToGTM({
          event: 'wallet_auth_success',
          category: 'Wallet',
          action: 'Authentication Success',
          label: address
        });
      }
    } else if (authenticated && user?.wallet?.address) {      
      // If authenticated with Privy and no external wallet, use embedded wallet address
      setWalletAddress(user.wallet.address); // Embedded wallet address
      if(!window.walletAuthTracked){
        window.walletAuthTracked = true; // Set flag to prevent duplicate tracking
        pushToGTM({
          event: 'wallet_auth_success',
          category: 'Wallet',
          action: 'Authentication Success',
          label: user.wallet.address
        });
      }
    }
  }, [authenticated, user, isConnected, address]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (walletAddress2 && authenticated) {
        try {
          // Fetch user profile from your API
          const token = await getAccessToken();
          const myHeaders: HeadersInit = {
            "Content-Type": "application/json",
            ...(walletAddress2 && {
              "x-wallet-address": walletAddress2,
              Authorization: `Bearer ${token}`,
            }),
          };

          const raw = JSON.stringify({ address: walletAddress2 });

          const requestOptions: any = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
          };

          // Add this debug log

          const res = await fetchApi(
            `/profile/${walletAddress2.toLowerCase()}`,
            requestOptions
          );
          const dbResponse = await res.json();

          if (dbResponse.data.length > 0) {
            const profileImage = dbResponse.data[0]?.image;
            setUserProfileImage(
              profileImage
                ? `https://gateway.lighthouse.storage/ipfs/${profileImage}`
                : null
            );
          }

          // Fetch ENS data
          const ensData = await fetchEnsNameAndAvatar(walletAddress2);
          setEnsAvatar(ensData?.avatar || null);

          // Get ENS name
          const displayName = await fetchEnsName(walletAddress2);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [walletAddress2, authenticated]);

  const getDisplayImage = () => {
    if (ensAvatar) {
      return ensAvatar;
    } else if (userProfileImage) {
      return userProfileImage;
    } else {
      return user2;
    }
  };

  // const handleChainSwitch = async () => {
  //   if (activeWallet?.switchChain) {
  //     try {
  //       // You can customize which chain to switch to
  //       await activeWallet.switchChain(1); // Switch to Ethereum mainnet
  //     } catch (error) {
  //       console.error("Failed to switch chain:", error);
  //     }
  //   }
  // };

  if (!ready) {
    return null; // or loading spinner
  }
  const handleLogin = async () => {
    pushToGTM({
      event: 'wallet_connect_click',
      category: 'Wallet',
      action: 'Connect Button Click',
      label: 'Initial Connect Attempt'
    });
    if (!authenticated) {
      try{
        await login();
      pushToGTM({
        event: 'wallet_connect_start',
        category: 'Wallet',
        action: 'Connect Flow Started',
        label: 'Login Modal Opened'
      });
      }catch(error){
        pushToGTM({
          event: 'wallet_connect_error',
          category: 'Wallet',
          action: 'Connect Error',
          label: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
    } else {
      if (!user?.google && !user?.farcaster) {
        try{
          await connectWallet();
          pushToGTM({
            event: 'wallet_connected',
            category: 'Wallet',
            action: 'Wallet Connected',
            label: 'Additional Wallet Connected'
          });
        }catch(error){
          pushToGTM({
            event: 'wallet_connect_error',
            category: 'Wallet',
            action: 'Connect Error',
            label: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }
  };
  const isValidAuthentication = () => {
    // Improved authentication check
    const hasEmbeddedWallet = user?.google || user?.farcaster;
    const hasWeb3Wallet = wallets.some((wallet) => wallet.address);

    // Return true if authenticated and has either embedded or web3 wallet
    return (
      authenticated && (hasEmbeddedWallet || (hasWeb3Wallet && isConnected))
    );
  };

  const canAccessProtectedResources = () => {
    return isValidAuthentication();
  };

  const isValid = canAccessProtectedResources();


  return (
    <div className="wallet z-10 font-poppins">
      {!isValid ? (
        <>
          <button
            onClick={handleLogin}
            type="button"
            className="flex md:hidden items-center justify-center text-blue-shade-200 bg-white hover:bg-blue-shade-500 border-white rounded-full p-2 md:px-5 md:py-4 text-xs  font-bold transition-transform transform hover:scale-105"
          >
            <BiSolidWallet className="size-5" />
            {/* <span className="hidden md:block">Connect Wallet</span> */}
          </button>
          <button
            onClick={handleLogin}
            type="button"
            className="hidden md:flex items-center justify-center  bg-gradient-to-br from-blue-50 to-blue-100 text-blue-shade-200 px-4 py-3 rounded-full  shadow-lg hover:shadow-xl  transition-all duration-300  group relative overflow-hidden transform-none hover:scale-105 text-xs font-medium"
          >
            <Wallet
              size={16}
              className="mr-2 size-5  group-hover:rotate-6 transition-transform"
            />
            <span className="font-poppins mt-1 ">Connect Wallet</span>
          </button>
        </>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden lg:block">
            <ChainSwitcherHeader
              address={walletAddress2 ? walletAddress2 : ""}
              currentChainId={chain?.id}
              switchChain={switchChain}
              ensAvatar={ensAvatar}
            />
          </div>

          {/* Mobile View */}
          <MobileChainSwitcher
            login={login}
            getDisplayImage={getDisplayImage}
            address={walletAddress2 ?? ""}
            currentChainId={chain?.id}
            switchChain={switchChain}
            ensAvatar={ensAvatar}
            authenticated={authenticated}
          />
        </>
      )}
    </div>
  );
}

export default ConnectWalletWithENS;
