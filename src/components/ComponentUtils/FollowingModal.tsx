// import { IoClose } from "react-icons/io5";
// import user1 from "@/assets/images/daos/CCLogo2.png";
// // import user1 from "@/assets/images/sidebar/favicon.png";
// import { FaCalendarDays } from "react-icons/fa6";
// import Image from "next/image";
// import { IoCopy } from "react-icons/io5";
// import { BiSolidBellOff, BiSolidBellRing } from "react-icons/bi";
// import { Tooltip } from "@nextui-org/react";
// import copy from "copy-to-clipboard";
// import toast, { Toaster } from "react-hot-toast";
// import { useEffect, useState } from "react";
// import { fetchEnsNameAndAvatar } from "@/utils/ENSUtils";
// import style from "./FollowingModal.module.css";
// import oplogo from "@/assets/images/daos/op.png";
// import arbcir from "@/assets/images/daos/arb.png";
// import { useAccount } from "wagmi";
// import { useRouter } from "next-nprogress-bar";

// interface FollowingModal {
//   userFollowings: any;
//   toggleFollowing: any;
//   toggleNotification: any;
//   setIsFollowingModalOpen: any;
//   isLoading: any;
//   handleUpdateFollowings: any;
//   daoName: string;
// }
// function formatDate(timestamp: string) {
//   const date = new Date(timestamp);
//   // const options = { year: "numeric", month: "long" };
//   const options: Intl.DateTimeFormatOptions = {
//     year: "numeric",
//     month: "long",
//   };
//   return `Since ${date.toLocaleDateString("en-US", options)}`;
// }

// function FollowingModal({
//   userFollowings,
//   toggleFollowing,
//   toggleNotification,
//   setIsFollowingModalOpen,
//   isLoading,
//   handleUpdateFollowings,
//   daoName,
// }: FollowingModal) {
//   const [ensNames, setEnsNames] = useState<any>({});
//   const [ensAvatars, setEnsAvatars] = useState<any>({});
//   const [chainName, setChainName] = useState("");
//   const { chain } = useAccount();
//   const [activeButton, setActiveButton] = useState("");
//   const router = useRouter();
//   const [isButtonLoading, setIsButtonLoading] = useState(false);
//   const [tooltipContent, setTooltipContent] = useState('Copy');
//   const [animatingAddresses, setAnimatingAddresses] = useState<{ [key: string]: boolean }>({});

//   const handleChainChange = async (chain: string) => {
//     setActiveButton(chain);
//     setIsButtonLoading(true); // Start loading
//     await handleUpdateFollowings(chain, 0, 0);
//     setIsButtonLoading(false); // Stop loading
//     setChainName(chain);
//   };

//   const handleCopy = (addr: string) => {
//     copy(addr);
//     setTooltipContent('Copied');
//     // Set animation state for specific address
//     setAnimatingAddresses(prev => ({ ...prev, [addr]: true }));

//     setTimeout(() => {
//       setTooltipContent('Copy');
//       setAnimatingAddresses(prev => ({ ...prev, [addr]: false }));
//     }, 4000);
//   };

//   const handleRedirect = (address: string) => {
//     if (chainName) {
//       router.push(`/${chainName}/${address}?active=info`);
//     } else {
//       console.error("Chain name is undefined");
//     }
//   };

//   useEffect(() => {
//     if (chain && chain?.name === "OP Mainnet") {
//       handleChainChange("optimism");
//     } else if (chain && chain?.name === "Arbitrum One") {
//       handleChainChange("arbitrum");
//     }
//   }, [chain]);

//   useEffect(() => {
//     const fetchEnsNames = async () => {
//       const addresses = userFollowings.map(
//         (user: any) => user.follower_address
//       );
//       const names = await Promise.all(
//         addresses.map(async (address: any) => {
//           const ensNames = await fetchEnsNameAndAvatar(address);
//           const ensName = ensNames?.ensName;

//           return { address, ensName };
//         })
//       );
//       const ensNameMap: { [address: string]: any } = {};
//       names.forEach(({ address, ensName }) => {
//         ensNameMap[address] = ensName;
//       });
//       setEnsNames(ensNameMap);
//     };

//     const fetchEnsNameAndAvatars = async () => {
//       const addresses = userFollowings.map(
//         (user: any) => user.follower_address
//       );
//       const avatars = await Promise.all(
//         addresses.map(async (address: any) => {
//           const ensAvatars = await fetchEnsNameAndAvatar(address);
//           const avatar = ensAvatars?.avatar;

//           return { address, avatar };
//         })
//       );
//       const ensAvatarMap: { [address: string]: any } = {};
//       avatars.forEach(({ address, avatar }) => {
//         ensAvatarMap[address] = avatar;
//       });
//       setEnsAvatars(ensAvatarMap);
//     };
//     if (userFollowings.length > 0) {
//       fetchEnsNames();
//     }
//     if (userFollowings.length > 0) {
//       fetchEnsNameAndAvatars();
//     }
//   }, [userFollowings]);
//   return (
//     <>
//       <div
//         className="font-poppins z-[70] fixed inset-0 flex items-center justify-center backdrop-blur-md"
//         onClick={(event) => {
//           event.stopPropagation();
//           setIsFollowingModalOpen(false);
//         }}
//       >
//         <div
//           className="bg-white rounded-[41px] overflow-hidden shadow-lg w-full max-w-3xl mx-2 xs:mx-4 sm:mx-8 2md:mx-auto"
//           onClick={(event) => {
//             event.stopPropagation();
//           }}
//         >
//           <div className="relative">
//             <div className="flex text-white bg-[#292929] px-4 sm:px-10 items-center justify-between py-7">
//               <h2 className="text-lg sm:text-xl font-semibold ">Followings</h2>
//               <div
//                 className="p-1 sm:p-1.5 rounded-full bg-[#F23535] flex items-center justify-center cursor-pointer"
//                 onClick={() => setIsFollowingModalOpen(false)}
//               >
//                 <IoClose className=" text-white w-4 h-4 sm:w-5 sm:h-5 " />
//               </div>
//             </div>
//             <div
//               className={` max-h-[60vh] overflow-y-auto ${style.customscrollbar}`}
//             >
//               <div className="flex ml-7 xm:ml-10 mt-5 gap-3 xm:gap-5 ">
//                 <button
//                   className={`border border-[#CCCCCC] px-2 xm:px-4 py-1 rounded-lg text-base xm:text-lg flex w-[190px] xm:w-[223px] items-center justify-center gap-1.5 ${
//                     activeButton === "optimism"
//                       ? "bg-[#8E8E8E] text-white"
//                       : "bg-[#F5F5F5] text-[#3E3D3D]"
//                   }`}
//                   onClick={() => handleChainChange("optimism")}
//                   disabled={isButtonLoading}
//                 >
//                   {isButtonLoading && activeButton === "optimism" ? (
//                     <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> // Skeleton Loader
//                   ) : (
//                     <>
//                       <Image src={oplogo} alt="optimism" width={23} />
//                       Optimism Collective
//                     </>
//                   )}
//                 </button>
//                 <button
//                   className={`border border-[#CCCCCC] px-2 xm:px-4 py-1 w-[125px] xm:w-[141px] rounded-lg text-base xm:text-lg flex items-center justify-center gap-1.5 ${
//                     activeButton === "arbitrum"
//                       ? "bg-[#8E8E8E] text-white"
//                       : "bg-[#F5F5F5] text-[#3E3D3D]"
//                   }`}
//                   onClick={() => handleChainChange("arbitrum")}
//                   disabled={isButtonLoading}
//                 >
//                   {isButtonLoading && activeButton === "arbitrum" ? (
//                     <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> // Skeleton Loader
//                   ) : (
//                     <>
//                       <Image src={arbcir} alt="arbitrum" width={23} />
//                       Arbitrum
//                     </>
//                   )}
//                 </button>
//               </div>
//               <hr className="border-t border-gray-300 mt-4 sm:my-6 mx-7 xm:mx-10" />
//               {isLoading ? (
//                 <div className="flex justify-center items-center h-40">
//                   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-shade-200"></div>
//                 </div>
//               ) : userFollowings.length > 0 ? (
//                 userFollowings.map((user: any, index: any) => (
//                   <>
//                     <div
//                       key={index}
//                       className="flex justify-between items-center px-2 py-5 xs:p-5 xm:py-6 xm:px-10"
//                     >
//                       <div className="flex items-center">
//                         <Image
//                           src={ensAvatars[user.follower_address] || user1} //add ens avatar
//                           alt={user.follower_address}
//                           className=" rounded-full mr-2 xs:mr-4 size-8 xm:size-10"
//                           width={40}
//                           height={40}
//                         />
//                         <div className="gap-1 flex flex-col">
//                           <div className="flex gap-0.5 xs:gap-2 items-center">
//                             <div
//                               className="font-semibold text-sm xs:text-base hover:text-blue-shade-100 cursor-pointer"
//                               onClick={() =>
//                                 handleRedirect(user.follower_address)
//                               }
//                             >
//                               {/* {user.follower_address.slice(0, 6)}...  */}
//                               {/* {user.follower_address.slice(-4)} */}
//                               {ensNames[user.follower_address] ||
//                                 user.follower_address.slice(0, 6) +
//                                   "..." +
//                                   user.follower_address.slice(-4)}
//                             </div>
//                             <IoCopy
//                               className={`${animatingAddresses[user.follower_address] ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'} size-3 xs:size-4 hover:text-blue-shade-100 cursor-pointer`}
//                               onClick={(event) => {
//                                 event.stopPropagation();
//                                 handleCopy(`${user.follower_address}`);
//                               }}
//                             />
//                           </div>
//                           <div className="flex gap-1 items-center">
//                             <FaCalendarDays className="size-3" />
//                             <p className="text-xs xs:text-sm ">
//                               {formatDate(user.timestamp)}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-1 xm:gap-4">
//                         <Tooltip
//                           content={
//                             user.isFollowing
//                               ? "Unfollow this delegate to stop receiving their updates."
//                               : "Follow this delegate to receive their latest updates."
//                           }
//                           placement="top"
//                           closeDelay={1}
//                           showArrow
//                         >
//                           <button
//                             className={`font-semibold rounded-full justify-center text-xs xs:text-sm xm:text-base py-1 xs:py-2 xm:py-[10px] flex items-center w-[80px] xs:w-[90px] xm:w-[127.68px]  ${
//                               user.isFollowing
//                                 ? "bg-white text-blue-shade-100 border border-blue-shade-100 hover:bg-blue-shade-400"
//                                 : "bg-blue-shade-200 text-white"
//                             }`}
//                             onClick={(event) => {
//                               event.stopPropagation();
//                               toggleFollowing(index, user, chainName);
//                             }}
//                           >
//                             {user.isFollowing ? "Unfollow" : "Follow"}
//                           </button>
//                         </Tooltip>

//                         <Tooltip
//                           content={
//                             user.isNotification
//                               ? "Click to mute delegate activity alerts."
//                               : "Don't miss out! Click to get alerts on delegate activity."
//                           }
//                           placement="top"
//                           closeDelay={1}
//                           showArrow
//                         >
//                           <div className="text-xs xm:text-sm border-blue-shade-100 text-blue-shade-100 border rounded-full size-8 xs:size-10 xm:size-11 flex items-center justify-center cursor-pointer hover:bg-blue-shade-400">
//                             {user.isNotification ? (
//                               <BiSolidBellRing
//                                 className="size-3 xs:size-4 xm:size-5"
//                                 color="bg-blue-shade-200"
//                                 size={20}
//                                 onClick={(event) => {
//                                   event.stopPropagation();
//                                   toggleNotification(index, user, chainName);
//                                 }}
//                               />
//                             ) : (
//                               <BiSolidBellOff
//                                 className="size-4 xm:size-5"
//                                 color="bg-blue-shade-200"
//                                 size={20}
//                                 onClick={(event) => {
//                                   event.stopPropagation();
//                                   toggleNotification(index, user, chainName);
//                                 }}
//                               />
//                             )}
//                           </div>
//                         </Tooltip>
//                       </div>
//                     </div>
//                     {index < userFollowings.length - 1 && (
//                       <hr className="border-[#DDDDDD] border-0.5" />
//                     )}
//                   </>
//                 ))
//               ) : (
//                 <div className="flex justify-center items-center h-40">
//                   <p>No followings found.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
// export default FollowingModal;

// FollowingModal.tsx
import { IoClose } from "react-icons/io5";
import { FaCalendarDays } from "react-icons/fa6";
import { IoCopy } from "react-icons/io5";
import { BiSolidBellOff, BiSolidBellRing, BiSearch } from "react-icons/bi";
import { Tooltip, Pagination } from "@nextui-org/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next-nprogress-bar";
import { fetchEnsNameAndAvatar } from "@/utils/ENSUtils";
import style from "./FollowingModal.module.css";
import copy from "copy-to-clipboard";
import defaultAvatar from "@/assets/images/daos/CCLogo2.png";
import { daoConfigs } from "@/config/daos";

interface FollowingModalProps {
  userFollowings: any[];
  toggleFollowing: (index: number, user: any, chainName: string) => void;
  toggleNotification: (index: number, user: any, chainName: string) => void;
  setIsFollowingModalOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  handleUpdateFollowings: (
    chain: string,
    offset: number,
    limit: number
  ) => Promise<void>;
  daoName: string;
}

interface EnsData {
  [key: string]: any;
}



function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };
  return `Since ${date.toLocaleDateString("en-US", options)}`;
}

function FollowingModal({
  userFollowings,
  toggleFollowing,
  toggleNotification,
  setIsFollowingModalOpen,
  isLoading,
  handleUpdateFollowings,
  daoName,
}: FollowingModalProps) {
  const [ensNames, setEnsNames] = useState<EnsData>({});
  const [ensAvatars, setEnsAvatars] = useState<EnsData>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDao, setSelectedDao] = useState("all");
  const router = useRouter();
  const [tooltipContent, setTooltipContent] = useState("");
  const [displayedFollowings, setDisplayedFollowings] =
    useState(userFollowings);
  const [animatingAddresses, setAnimatingAddresses] = useState<{
    [key: string]: boolean;
  }>({});
  const [loader,setLoader]=useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const excludedDaos = ["arbitrumSepolia"];

  useEffect(() => {
    setLoader(true);
    setSelectedDao("all");
    handleUpdateFollowings("all",0, 0);
  }, []); // Only run on mount

  console.log(userFollowings);

  // Get available DAOs from daoConfigs
  const availableDaos = [
    { id: "all", name: "All DAOs" },
    ...Object.entries(daoConfigs)
      .filter(([key]) => !excludedDaos.includes(key))
      .map(([key, config]) => ({
        id: key,
        name: config.name,
        logo: config.logo,
        chainId: config.chainId,
      })),
  ];

  const handleCopy = (addr: string) => {
    copy(addr);
    setTooltipContent("Copied");
    setAnimatingAddresses((prev) => ({ ...prev, [addr]: true }));

    setTimeout(() => {
      setTooltipContent("Copy");
      setAnimatingAddresses((prev) => ({ ...prev, [addr]: false }));
    }, 4000);
  };

  const handleRedirect = (address: string, dao: string) => {
    const url = `/${dao}/${address}?active=info`;
    window.open(url, "_blank"); // Opens in a new tab
  };

  // // Filter followings based on search query and selected DAO
  // const filteredFollowings = userFollowings.filter(async user => {
  //   const matchesSearch =
  //     searchQuery === "" ||
  //     user.follower_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     (ensNames[user.follower_address] || "").toLowerCase().includes(searchQuery.toLowerCase());

  //   if(selectedDao!=="all"){
  //     await handleUpdateFollowings(selectedDao, 0, 0)
  //   }

  //   const matchesDao =
  //     selectedDao === "all" ||
  //     user.chainName === selectedDao;

  //   return matchesSearch && matchesDao;
  // });

  const handleDaoChange = async (value: string) => {
    setSelectedDao(value);
    setLoader(true);
    await handleUpdateFollowings(value, 0, 0);
  };

  const filteredFollowings = displayedFollowings.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.follower_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ensNames[user.follower_address] || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Update displayed followings when userFollowings changes
  useEffect(() => {
    setDisplayedFollowings(userFollowings);
    setLoader(false);
  }, [userFollowings]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredFollowings.length / itemsPerPage);
  const currentFollowings = filteredFollowings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination when DAO changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDao]);

  useEffect(() => {
    const fetchEnsData = async () => {
      if (userFollowings.length === 0) return;

      const addresses = userFollowings.map((user) => user.follower_address);
      const ensData = await Promise.all(
        addresses.map(async (address) => {
          const data = await fetchEnsNameAndAvatar(address);
          return { address, ...data };
        })
      );

      const nameMap: EnsData = {};
      const avatarMap: EnsData = {};
      ensData.forEach(({ address, ensName, avatar }) => {
        nameMap[address] = ensName;
        avatarMap[address] = avatar;
      });

      setEnsNames(nameMap);
      setEnsAvatars(avatarMap);
    };

    fetchEnsData();
  }, [userFollowings]);

  return (
    <div
      className="font-poppins z-[70] fixed inset-0 flex items-center justify-center backdrop-blur-md"
      onClick={() => setIsFollowingModalOpen(false)}
    >
      <div
        className="bg-white rounded-[41px] overflow-hidden shadow-lg w-full max-w-3xl mx-2 xs:mx-4 sm:mx-8 2md:mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* Header */}
          <div className="flex text-white bg-[#292929] px-4 sm:px-10 items-center justify-between py-7">
            <h2 className="text-lg sm:text-xl font-semibold">Followings</h2>
            <div
              className="p-1 sm:p-1.5 rounded-full bg-[#F23535] flex items-center justify-center cursor-pointer"
              onClick={() => setIsFollowingModalOpen(false)}
            >
              <IoClose className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          {/* Search and DAO Selection */}
          <div
            className={`max-h-[60vh] overflow-y-auto ${style.customscrollbar}`}
          >
            <div className="px-7 xm:px-10 pt-5 pb-4 space-y-4">
              {/* Search Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by address or ENS"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-shade-100"
                />
                <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
              </div>

              {/* DAO Dropdown */}
              <select
                value={selectedDao}
                onChange={(e) =>handleDaoChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-shade-100"
              >
                {availableDaos.map((dao) => (
                  <option key={dao.id} value={dao.id}>
                    {dao.name}
                  </option>
                ))}
              </select>
            </div>

            <hr className="border-t border-gray-300 mx-7 xm:mx-10" />

            {/* Followers List */}
            {isLoading || loader ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-shade-200" />
              </div>
            ) : currentFollowings.length > 0 ? (
              currentFollowings.map((user, index) => (
                <div key={user.follower_address}>
                  <div className="flex justify-between items-center px-2 py-5 xs:p-5 xm:py-6 xm:px-10">
                    <div className="flex items-center">
                      <Image
                        src={ensAvatars[user.follower_address] || defaultAvatar}
                        alt={user.follower_address}
                        className="rounded-full mr-2 xs:mr-4 size-8 xm:size-10"
                        width={40}
                        height={40}
                      />
                      <div className="gap-1 flex flex-col">
                        <div className="flex gap-0.5 xs:gap-2 items-center">
                          <div
                            className="font-semibold text-sm xs:text-base hover:text-blue-shade-100 cursor-pointer"
                            onClick={() =>
                              handleRedirect(user.follower_address,user.dao)
                            }
                          >
                            {ensNames[user.follower_address] ||
                              `${user.follower_address.slice(
                                0,
                                6
                              )}...${user.follower_address.slice(-4)}`}
                          </div>
                          <Tooltip content={tooltipContent}>
                            <IoCopy
                              className={`${
                                animatingAddresses[user.follower_address]
                                  ? "text-blue-500"
                                  : "text-gray-400 hover:text-gray-600"
                              } size-3 xs:size-4 hover:text-blue-shade-100 cursor-pointer`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(user.follower_address);
                              }}
                            />
                          </Tooltip>
                          {/* Network Logo */}
                          <Image
                            src={daoConfigs[user.dao]?.logo || defaultAvatar}
                            alt={user.chainName}
                            className="size-4 xs:size-5 rounded-full"
                            width={20}
                            height={20}
                          />
                        </div>
                        <div className="flex gap-1 items-center">
                          <FaCalendarDays className="size-3" />
                          <p className="text-xs xs:text-sm">
                            {formatDate(user.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Follow/Unfollow and Notification Buttons */}
                    <div className="flex items-center gap-1 xm:gap-4">
                      <Tooltip
                        content={
                          user.isFollowing
                            ? "Unfollow this delegate to stop receiving their updates."
                            : "Follow this delegate to receive their latest updates."
                        }
                        placement="top"
                        closeDelay={1}
                        showArrow
                      >
                        <button
                          className={`font-semibold rounded-full justify-center text-xs xs:text-sm xm:text-base 
                                    py-1 xs:py-2 xm:py-[10px] flex items-center w-[80px] xs:w-[90px] xm:w-[127.68px]
                                    ${
                                      user.isFollowing
                                        ? "bg-white text-blue-shade-100 border border-blue-shade-100 hover:bg-blue-shade-400"
                                        : "bg-blue-shade-200 text-white"
                                    }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollowing(index, user, user.dao);
                          }}
                        >
                          {user.isFollowing ? "Unfollow" : "Follow"}
                        </button>
                      </Tooltip>

                      <Tooltip
                        content={
                          user.isNotification
                            ? "Click to mute delegate activity alerts."
                            : "Don't miss out! Click to get alerts on delegate activity."
                        }
                        placement="top"
                        closeDelay={1}
                        showArrow
                      >
                        <div className="text-xs xm:text-sm border-blue-shade-100 text-blue-shade-100 border rounded-full size-8 xs:size-10 xm:size-11 flex items-center justify-center cursor-pointer hover:bg-blue-shade-400">
                          {user.isNotification ? (
                            <BiSolidBellRing
                              className="size-3 xs:size-4 xm:size-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleNotification(index, user, user.dao);
                              }}
                            />
                          ) : (
                            <BiSolidBellOff
                              className="size-4 xm:size-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleNotification(index, user, user.dao);
                              }}
                            />
                          )}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  {index < currentFollowings.length - 1 && (
                    <hr className="border-[#DDDDDD] border-0.5" />
                  )}
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center h-40">
                <p>No followings found.</p>
              </div>
            )}

            {/* Pagination */}
            {filteredFollowings.length > itemsPerPage && (
              <div className="flex justify-center py-4">
                <Pagination
                  total={totalPages}
                  initialPage={1}
                  page={currentPage}
                  onChange={setCurrentPage}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FollowingModal;
