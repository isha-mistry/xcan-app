import Image from "next/image";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next-nprogress-bar";
import toast, { Toaster } from "react-hot-toast";
// import { useConnectModal, useChainModal } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import WalletAndPublicClient from "@/helpers/signer";
import ErrorDisplay from "../ComponentUtils/ErrorDisplay";
import { fetchEnsAddress } from "@/utils/ENSUtils";
import DelegateTileModal from "../ComponentUtils/DelegateTileModal";
import {
  arb_client,
  DELEGATE_CHANGED_QUERY,
  op_client,
} from "@/config/staticDataUtils";
import { getChainAddress } from "@/utils/chainUtils";
import { arbitrum, optimism } from "viem/chains";
import { CiSearch } from "react-icons/ci";
import { IoCopy } from "react-icons/io5";
import { Tooltip } from "@nextui-org/react";
import dao_abi from "../../artifacts/Dao.sol/GovernanceToken.json";
import { useConnection } from "@/app/hooks/useConnection";
import OPLogo from "@/assets/images/daos/op.png";
import ARBLogo from "@/assets/images/daos/arbitrum.jpg";
import ccLogo from "@/assets/images/daos/CCLogo2.png";
import DelegateInfoCard from "./DelegateInfoCard";
import { truncateAddress } from "@/utils/text";
import DelegateListSkeletonLoader from "../SkeletonLoader/DelegateListSkeletonLoader";
import { ChevronDown } from "lucide-react";
import debounce from "lodash/debounce";
import { getAccessToken, usePrivy, useWallets } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { motion } from "framer-motion";
// import { Select, SelectItem } from "@nextui-org/react"; // Removed
import { calculateTempCpi } from "@/actions/calculatetempCpi";
import { fetchApi } from "@/utils/api";
import { Address } from "viem";
import { daoConfigs } from "@/config/daos";
import { cacheExchange, createClient, fetchExchange } from "urql";
import {
  ArrowsRightLeftIcon ,  // Example icon from Heroicons
  FireIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface GTMEvent {
  event: string;
  category: string;
  action: string;
  label: string;
  value?: number;
  delegateFrom?: "delegateList" | "specificDelegate";
  delegationStatus?: "success" | "failure" | "pending";
}

interface SortOption {
  value: string;
  label: string;
  icon?: React.ComponentType<React.ComponentProps<"svg">>;
}

const sortOptions: SortOption[] = [
  { value: "random", label: "Random Delegates", icon: ArrowsRightLeftIcon   },
  { value: "default", label: "High-Weight Delegates", icon: FireIcon },
  // { value: "most-delegators", label: "Most Delegators", icon: ChartBarIcon }, // Coming soon
];

const DELEGATES_PER_PAGE = 20;
const DEBOUNCE_DELAY = 500;

function DelegatesList({ props }: { props: string }) {
  const {
    isConnected: isUserConnected,
    isLoading,
    isPageLoading,
    isReady,
  } = useConnection();
  const [delegateData, setDelegateData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAPICalling, setIsAPICalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedDelegate, setSelectedDelegate] = useState<any>(null);
  const [delegateOpen, setDelegateOpen] = useState(false);
  const [delegateDetails, setDelegateDetails] = useState<any>();
  const [same, setSame] = useState(false);
  const [delegatingToAddr, setDelegatingToAddr] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const [sortOption, setSortOption] = useState("random");
  const { wallets } = useWallets();
  const [isOpen, setIsOpen] = useState(false); // Dropdown state

  const router = useRouter();
  // const { openChainModal } = useChainModal();
  // const { openConnectModal } = useConnectModal();
  const { isConnected, address, chain } = useAccount();
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { walletAddress } = useWalletAddress();
  const [tempCpi, setTempCpi] = useState();
  const [tempCpiCalling, setTempCpiCalling] = useState(true);

  const pushToGTM = (eventData: GTMEvent) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push(eventData);
    }
  };
  const { data: accountBalance }: any = useReadContract({
    abi: dao_abi.abi,
    address: daoConfigs[props].chainAddress as `0x${string}`,
    functionName: "balanceOf",
    // args:['0x6eda5acaff7f5964e1ecc3fd61c62570c186ca0c' as Address]
    args: [walletAddress as Address],
    chainId: daoConfigs[props].chainId,
  });

  const fetchDelegates = useCallback(async () => {
    setIsAPICalling(true);
    try {
      const res = await fetch(
        `/api/get-delegate?skip=${skip}&dao=${props}&limit=${DELEGATES_PER_PAGE}&sort=${sortOption}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const formattedDelegates = await Promise.all(
        data.delegates.map(async (delegate: any) => {
          return {
            ...delegate,
            adjustedBalance: delegate.latestBalance / 10 ** 18,
            // profilePicture: props === "optimism" ? OPLogo : ARBLogo,
            profilePicture:daoConfigs[props].logo,
            ensName: truncateAddress(delegate.delegate),
          };
        })
      );

      setDelegateData((prev) => [...prev, ...formattedDelegates]);
      setSkip(data.nextSkip);
      setHasMore(data.hasMore);
      setError(null);
    } catch (error) {
      console.error("Error fetching delegates:", error);
      setError("Failed to fetch delegate data. Please try again.");
    } finally {
      setIsAPICalling(false);
    }
  }, [skip, props, hasMore, isAPICalling, sortOption]);

  useEffect(() => {
    fetchDelegates();
  }, [sortOption]);
  // Add handler for sort change

  const toggleOpen = () => setIsOpen(!isOpen);
  const selectedOption = sortOptions.find((option) => option.value === sortOption);

  const handleSortChange = (value: string) => {
    if (value === "most-delegators") {
      toast("Coming soon 🚀");
      return;
    }
    if (value !== sortOption) {
      setSortOption(value);
      setDelegateData([]); // Clear existing data
      setSkip(0); // Reset pagination
      setHasMore(true);
    }
    // Always close the dropdown
    setIsOpen(false);
  };

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query) {
          setDelegateData([]);
          setSkip(0);
          setHasMore(true);
          fetchDelegates();
          return;
        }

        setIsAPICalling(true);
        try {
          const res = await fetch(
            `/api/search-delegate?address=${query}&dao=${props}`
          );
          const filtered = await res.json();
          if (filtered.length > 0) {
            const formattedDelegate = {
              delegate: filtered[0].id,
              adjustedBalance: filtered[0].latestBalance / 10 ** 18,
              // profilePicture: props === "optimism" ? OPLogo : ARBLogo,
              profilePicture:daoConfigs[props].logo,
              ensName: truncateAddress(filtered[0].id),
            };
            setDelegateData([formattedDelegate]);
          } else {
            setDelegateData([]);
          }
          setHasMore(false);
        } catch (error) {
          console.error("Error fetching search results:", error);
          setDelegateData([]);
        } finally {
          setIsAPICalling(false);
          setSkip(0);
        }
      }, DEBOUNCE_DELAY),
    [props, fetchDelegates]
  );
  const handleSearchChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value.trim(); // Get the input value
      setSearchQuery(query); // Immediately update the input field
      // If the input is cleared, reset any search-related processing
      if (query === "") {
        console.log("Input cleared");
        debouncedSearch(""); // Optionally reset the query results
        return;
      }
      // Regex to check if the input is an Ethereum address
      const isEthereumAddress = /^0x[a-fA-F0-9]{40}$/.test(query);

      if (isEthereumAddress) {
        // If it's an Ethereum address, directly query it
        debouncedSearch(query);
      } else {
        // Validate input as a potential ENS name before resolving
        const isValidEnsName = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(query);

        if (!isValidEnsName) {
          console.warn("Invalid ENS name");
          return;
        }
        // Treat it as an ENS name and resolve the address
        try {
          const resolvedAddress = await fetchEnsAddress(query); // Resolve ENS to address
          if (resolvedAddress) {
            console.log("Resolved ENS address:", resolvedAddress);
            debouncedSearch(resolvedAddress); // Query using the resolved address
          } else {
            console.log("No address found for ENS name.");
          }
        } catch (error) {
          console.error("Error resolving ENS name:", error);
        }
      }
    },
    [debouncedSearch] // Ensure debounce function is included in dependencies
  );

  // useEffect(() => {
  //   return () => {
  //     debouncedSearch.cancel();
  //   };
  // }, [debouncedSearch]);

  const handleDelegateModal = async (delegateObject: any) => {
    setSelectedDelegate(delegateObject);
    if (!isConnected || !authenticated) {
      login();
      return;
    }
    pushToGTM({
      event: "delegate_modal_open",
      category: "Delegate Engagement",
      action: "Delegate Modal Open",
      label: "Delegate Modal Open - Delegate List",
      delegateFrom: "delegateList",
    });
    const delegatorAddress = walletAddress;
    const toAddress = delegateObject.delegate;
    const token = await getAccessToken();
    setDelegateOpen(true);

    const client = createClient({
      url: daoConfigs[props].delegateChangedsUrl,
      exchanges: [cacheExchange, fetchExchange],
    });
    

    try {
      const data = await client.query(
        DELEGATE_CHANGED_QUERY,
        {
          delegator: walletAddress,
        }
      );
      const delegate = data.data.delegateChangeds[0]?.toDelegate;
      setSame(
        delegate?.toLowerCase() === delegateObject.delegate.toLowerCase()
      );
      setDelegateDetails(delegate);
    } catch (err) {
      console.error(err);
    }

    if (daoConfigs[props].name.toLowerCase()==="optimism") {
      try {
        setTempCpiCalling(true);
        const result = await calculateTempCpi(
          delegatorAddress,
          toAddress,
          walletAddress,
          token
        );
        // console.log("result:::::::::", result);
        if (result?.data?.results[0].cpi) {
          const data = result?.data?.results[0].cpi;
          setTempCpi(data);
          setTempCpiCalling(false);
        }
      } catch (error) {
        console.log("Error in calculating temp CPI", error);
      }finally{
        setTempCpiCalling(false);
      }
    }
  };
  // const handleDelegateVotes = async (to: string) => {
  //   if (!walletAddress) {
  //     toast.error("Please connect your wallet!");
  //     return;
  //   }

  //   const chainAddress = getChainAddress(chain?.name);
  //   const network = props === "optimism" ? "OP Mainnet" : "Arbitrum One";
  //   alert(`189:${network}`);
  //   alert(`190:${walletClient?.chain.name}`);

  //   if (walletClient?.chain.name !== network) {
  //     toast.error("Please switch to the appropriate network to delegate!");
  //     // openChainModal?.();
  //     return;
  //   }

  //   try {
  //     setDelegatingToAddr(true);
  //     await walletClient.writeContract({
  //       address: chainAddress,
  //       chain: props === "arbitrum" ? arbitrum : optimism,
  //       abi: dao_abi.abi,
  //       functionName: "delegate",
  //       args: [to],
  //       account: walletAddress,
  //     });

  //     setConfettiVisible(true);
  //     setTimeout(() => setConfettiVisible(false), 5000);
  //     toast.success("Delegation successful!");
  //   } catch (error) {
  //     console.error("Delegation failed:", error);
  //     toast.error("Transaction failed");
  //   } finally {
  //     setDelegatingToAddr(false);
  //   }
  // };

  function getDaoNameFromUrl() {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const currentDAO=daoConfigs[props];
      if (url.includes(currentDAO.name.toLowerCase())) return currentDAO.name.toLowerCase();
      // if (url.includes("arbitrum")) return "arbitrum";
    }
    return "";
  }

  const handleDelegateVotes = async (
    to: string,
    from_delegate: string,
    tokens: any
  ) => {
    if (!walletAddress) {
      toast.error("Please connect your wallet!");
      pushToGTM({
        event: "delegation_attempt",
        category: "Delegate Engagement",
        action: "Delegation Attempt",
        label: "Delegation Attempt - Delegate Tile Modal",
        delegateFrom: "delegateList",
        delegationStatus: "failure",
      });
      return;
    }

    // const chainAddress = getChainAddress(chain?.name);
    const chainAddress=daoConfigs[props.toLowerCase()].chainAddress;
    if (!chainAddress) {
      toast.error("Invalid chain address,try again!");
      pushToGTM({
        event: "delegation_attempt",
        category: "Delegate Engagement",
        action: "Delegation Attempt",
        label: "Delegation Attempt - Delegate Tile Modal",
        delegateFrom: "delegateList",
        delegationStatus: "failure",
      });
      return;
    }

    // const network = props === "optimism" ? "OP Mainnet" : "Arbitrum One";
    const network=daoConfigs[props].chainName;
    // const chainId = props === "optimism" ? 10 : 42161;
    const chainId=daoConfigs[props].chainId;

    try {
      setDelegatingToAddr(true);
      pushToGTM({
        event: "delegation_attempt",
        category: "Delegate Engagement",
        action: "Delegation Attempt",
        label: "Delegation Attempt - Delegate Tile Modal",
        delegateFrom: "delegateList",
        delegationStatus: "pending",
      });

      // For Privy wallets, we should get the provider from the wallet instance
      const privyProvider = await wallets[0]?.getEthereumProvider();

      if (!privyProvider) {
        toast.error("Could not get wallet provider");
        pushToGTM({
          event: "delegation_attempt",
          category: "Delegate Engagement",
          action: "Delegation Attempt",
          label: "Delegation Attempt - Delegate Tile Modal",
          delegateFrom: "delegateList",
          delegationStatus: "failure",
        });
        return;
      }

      // Create ethers provider
      const provider = new BrowserProvider(privyProvider);

      // Get the current network
      const currentNetwork = await provider.getNetwork();
      const currentChainId = Number(currentNetwork.chainId);

      // Check if we're on the correct network
      if (currentChainId !== chainId) {
        // toast.error(`Please switch to ${network} (Chain ID: ${chainId})`);
        toast("Switching to correct netwotk,try again!");

        // Try to switch network
        try {
          await privyProvider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          });
        } catch (switchError) {
          console.error("Failed to switch network:", switchError);
          pushToGTM({
            event: "delegation_attempt",
            category: "Delegate Engagement",
            action: "Delegation Attempt",
            label: "Delegation Attempt - Delegate Tile Modal",
            delegateFrom: "delegateList",
            delegationStatus: "failure",
          });
          return;
        }
        return;
      }

      // console.log('Getting signer...');
      const signer = await provider.getSigner();

      // console.log('Creating contract instance...');
      const contract = new Contract(chainAddress, dao_abi.abi, signer);

      // console.log('Initiating delegation transaction...');
      const tx = await contract.delegate(to);
      await tx.wait();
      pushToGTM({
        event: "delegation_success",
        category: "Delegate Engagement",
        action: "Delegation Success",
        label: `Delegation Success - Delegate Tile Modal - ${getDaoNameFromUrl()}`,
        delegateFrom: "delegateList",
        delegationStatus: "success",
      });

      setConfettiVisible(true);
      setTimeout(() => setConfettiVisible(false), 5000);
      toast.success("Delegation successful!");

      const DAO = props;
      const Token =
        tokens === BigInt(0) || tokens === undefined
          ? "0.00"
          : Number(tokens / BigInt(Math.pow(10, 18))).toFixed(2); //For serialize bigInt
      const Clienttoken = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${Clienttoken}`,
        }),
      };

      const apiCallData = {
        address: walletAddress,
        delegation: {
          [DAO]: [
            {
              delegator: walletAddress,
              to_delegator: to,
              from_delegate:
                from_delegate === "N/A"
                  ? "0x0000000000000000000000000000000000000000"
                  : from_delegate,
              token: Token,
              page: "Delegatelist",
              timestamp: new Date(),
            },
          ],
        },
      };

      const response = await fetchApi("/track-delegation", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(apiCallData),
      });

      if (response.status === 200) {
        console.log("Done!");
      } else {
        throw new Error(
          `Failed to save delegation data! Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Delegation failed:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("eth_chainId is not supported")) {
        console.log("Provider state:", {
          provider: await wallets[0]?.getEthereumProvider(),
          network,
          chainId,
        });
        toast.error(`Network Error: Make sure you're connected to ${network}`);
      } else if (errorMessage.includes("user rejected")) {
        toast.error("Transaction was rejected by user");
      } else if (errorMessage.includes("network")) {
        toast.error(`Please connect to ${network} (Chain ID: ${chainId})`);
      } else {
        toast.error("Transaction failed. Please try again");
        console.error("Detailed error:", error);
      }
      pushToGTM({
        event: "delegation_failure",
        category: "Delegate Engagement",
        action: "Delegation Failure",
        label: `Delegation Failure - Delegate Tile Modal - ${getDaoNameFromUrl()}`,
        delegateFrom: "delegateList",
        delegationStatus: "failure",
      });
    } finally {
      setDelegatingToAddr(false);
    }
  };
  const formatNumber = (number: number) => {
    if (number >= 1e6) return `${(number / 1e6).toFixed(2)}m`;
    if (number >= 1e3) return `${(number / 1e3).toFixed(2)}k`;
    return number.toFixed(2);
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ErrorDisplay
          message={error}
          onRetry={() => {
            setDelegateData([]);
            setSkip(0);
            setHasMore(true);
            fetchDelegates();
          }}
        />
      </div>
    );
  }

  const renderContent = () => {
    if (delegateData.length === 0 && !isLoading && !isAPICalling) {
      return (
        <>
          <div className="text-center py-12">
            <p className="text-2xl font-semibold mb-4">No delegates found</p>
            <p className="text-gray-600">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "Try adjusting your search or filters"}
            </p>
          </div>
        </>
      );
    }

    if (delegateData.length > 0) {
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {delegateData.map((delegate) => (
              <DelegateInfoCard
                key={delegate.delegate}
                delegate={delegate}
                daoName={props}
                onCardClick={() =>
                  router.push(`/${props}/${delegate.delegate}?active=info`)
                }
                onDelegateClick={handleDelegateModal}
                formatNumber={formatNumber}
              />
            ))}
          </div>
          {isAPICalling && <DelegateListSkeletonLoader />}
          {hasMore && !searchQuery && !isLoading && (
            <div className="flex justify-center mt-8">
              <button
                className="group inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
                onClick={fetchDelegates}
                disabled={isAPICalling}
              >
                {isAPICalling ? (
                  <span className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-3 -ml-1 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Load More
                    <ChevronDown className="w-4 h-4 ml-2 transform group-hover:translate-y-0.5 transition-transform duration-150 ease-in-out" />
                  </span>
                )}
              </button>
            </div>
          )}
        </>
      );
    }

    if (!isLoading) {
      return (
        <>
          <DelegateListSkeletonLoader />
        </>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <Toaster
                  toastOptions={{
                    style: {
                      fontSize: "14px",
                      backgroundColor: "#3E3D3D",
                      color: "#fff",
                      boxShadow: "none",
                      borderRadius: "50px",
                      padding: "3px 5px",
                      marginTop: "64px",
                    },
                  }}
                /> */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="relative w-full md:w-96 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search by exact ENS or Address"
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={handleSearchChange}
          />

          <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Custom Select Component - Inlined */}
        <div className="relative w-full md:w-60">
          <motion.button
            type="button"
            className="w-full bg-white border border-gray-300 rounded-2xl shadow-lg py-3 px-6 text-sm font-semibold text-gray-800 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 flex items-center justify-between transition-all duration-200 transform hover:scale-102 active:scale-98"
            id="sort-menu-button"
            aria-expanded={isOpen}
            aria-haspopup="true"
            onClick={toggleOpen}
            aria-label="Sort delegates"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="truncate">{selectedOption ? selectedOption.label : "Sort By"}</span>
            <ChevronDown className={`w-6 h-6 ml-3 transform transition-transform text-gray-600 ${isOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <motion.div
            className={`absolute top-full left-0 z-30 w-full mt-3 rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden`}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="sort-menu-button"
            tabIndex={-1}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ pointerEvents: isOpen ? "auto" : "none" }}
          >
            <div className="py-2" role="none">
              {sortOptions.map((option) => {
                const Icon = option.icon ? option.icon : undefined;
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => {
                      handleSortChange(option.value);
                      // setIsOpen(false);
                    }}
                    className={`group flex items-center w-full px-6 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 focus:outline-none focus:bg-blue-50 dark:focus:bg-gray-800 transition-colors duration-150 ${option.value === sortOption ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 font-semibold' : ''}`}
                    role="menuitem"
                    tabIndex={-1}
                    whileHover={{ backgroundColor: "#e0f2fe" }}
                    whileTap={{ scale: 0.95 }}
                  >
                     {Icon && <Icon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />}
                    <span className="truncate">{option.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
        {/* End Custom Select */}

      </div>

      {renderContent()}

      {delegateOpen && selectedDelegate && (
        <DelegateTileModal
          tempCpi={tempCpi}
          tempCpiCalling={tempCpiCalling}
          isOpen={delegateOpen}
          closeModal={() => setDelegateOpen(false)}
          handleDelegateVotes={() =>
            handleDelegateVotes(
              selectedDelegate.delegate,
              delegateDetails || "N/A",
              accountBalance
            )
          }
          fromDelegate={delegateDetails || "N/A"}
          delegateName={
            selectedDelegate.ensName ||
            `${selectedDelegate.delegate.slice(
              0,
              6
            )}...${selectedDelegate.delegate.slice(-4)}`
          }
          displayImage={
            selectedDelegate.profilePicture ||
            (daoConfigs[props].logo)
          }
          daoName={props}
          addressCheck={same}
          delegatingToAddr={delegatingToAddr}
          confettiVisible={confettiVisible}
        />
      )}
    </div>
  );
}

export default DelegatesList;