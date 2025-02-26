import React, { useEffect, useState } from "react";
import Image from "next/image";
import user from "@/assets/images/user/user1.svg";
import { IoArrowDown } from "react-icons/io5";
import Arrow1 from "@/assets/images/daos/arrow1.png";
import Arrow2 from "@/assets/images/daos/arrow2.png";
import Link from "next/link";
import { BASE_URL } from "@/config/constants";
import { HiOutlineExternalLink } from "react-icons/hi";
import { ThreeDots } from "react-loader-spinner";
import Confetti from "react-confetti";
import { useApiData } from "@/contexts/ApiDataContext";
import op from "@/assets/images/daos/op.png";
import arb from "@/assets/images/daos/arb.png";
import { useAccount, useReadContract } from "wagmi";
import dao_abi from "../../artifacts/Dao.sol/GovernanceToken.json";
import { Address } from "viem";
import { useRouter } from "next/router";

interface delegate {
  isOpen: boolean;
  closeModal: any;
  handleDelegateVotes: any;
  fromDelegate: any;
  delegateName: String;
  displayImage: any;
  daoName: String;
  addressCheck: boolean;
  delegatingToAddr: boolean;
  confettiVisible: boolean;
  tempCpi: any;
  tempCpiCalling: boolean;
}

function DelegateTileModal({
  isOpen,
  closeModal,
  handleDelegateVotes,
  fromDelegate,
  delegateName,
  displayImage,
  daoName,
  addressCheck,
  delegatingToAddr,
  confettiVisible,
  tempCpi,
  tempCpiCalling,
}: delegate) {
  const { isConnected, address, chain } = useAccount();
  const { apiData: cpiData, loading, error: errorApi } = useApiData();
  const actualCpi = cpiData?.data?.results[0]?.cpi || "";
  console.log("cpiData::::", cpiData);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [tokenImage, setTokenImage] = useState(op);
  const [screenHeight, setScreenHeight] = useState(0);
  const pathname = window.location.pathname;

  useEffect(() => {
    if (pathname.includes("arbitrum")) {
      setTokenImage(arb);
    } else {
      setTokenImage(op);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };

    // Set initial screen height
    setScreenHeight(window.innerHeight);

    // Add event listener for screen resize
    window.addEventListener("resize", handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };
  const { data: accountBalance }: any = useReadContract({
    abi: dao_abi.abi,
    address: pathname.includes("optimism") ? "0x4200000000000000000000000000000000000042":"0x912ce59144191c1204e64559fe8253a0e49e6548",
    functionName: "balanceOf",
    // args:['0x6eda5acaff7f5964e1ecc3fd61c62570c186ca0c' as Address]
    args: [address as Address],
  });
  // console.log(accountBalance, "acc balance", typeof accountBalance);
  const handleMouseLeave = () => {
    setIsHovering(false);
  };
  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Change the timeout duration as per your requirements
  }, []);

  const headingStyle = `font-semibold text-[26px] mb-2 text-blue-shade-100 text-center ${
    screenHeight < 750 ? "mt-36" : ""
  }`;

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden font-poppins">
        <div className="absolute inset-0 backdrop-blur-md"></div>
        <div className="bg-white px-6 py-8 rounded-2xl flex flex-col z-50 border-[2px] border-black-shade-900">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black-shade-900"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden font-poppins">
        <div
          className="absolute inset-0 backdrop-blur-md"
          onClick={closeModal}
        ></div>
        <div className="bg-white mt-12 p-5 xs:p-9 rounded-[34px] flex flex-col z-50 border-[2px] items-center justify-center mx-4 sm:mx-0 max-h-[85vh] overflow-y-auto">
          {" "}
          {/* Modified Div */}
          {confettiVisible && <Confetti />}
          <h1 className={headingStyle}>Set {delegateName} as your delegate</h1>
          <p className="font-normal text-[13px] text-center text-black-shade-1000 max-w-[400px]">
            {delegateName} will be able to vote with any token owned by your
            address
          </p>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 flex justify-center items-center py-6 rounded-3xl w-full flex-col mt-4 shadow-md">
            <p className="text-black font-medium text-sm tracking-wide uppercase mb-3">
              Total Delegatable Votes
            </p>
            <div className="flex items-center space-x-1">
              <span className="text-4xl font-bold text-black tracking-tighter">
                {accountBalance === BigInt(0) || accountBalance === undefined
                  ? "0.00"
                  : Number(accountBalance / BigInt(Math.pow(10, 18))).toFixed(
                      2
                    )}
              </span>
              <div className=" rounded-full p-2 ">
                <Image
                  src={tokenImage}
                  alt="OP Token"
                  className="w-10 h-10 object-contain"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 w-full">
            <div className="flex items-center rounded-3xl border-[2.5px] border-white bg-[#F4F4F4] pt-3 pb-5 xs:pt-4">
              <Image src={user} alt="" className="size-[46px] mx-5" />
              <div className="">
                <p className=" text-sm font-medium">Currently delegated to</p>
                {fromDelegate === "N/A" ? (
                  <p className="font-normal text-[12px]">{fromDelegate}</p>
                ) : (
                  <Link
                    href={`${BASE_URL}/${daoName}/${fromDelegate}?active=info`}
                    target="_blank"
                    className="font-normal text-[12px] flex gap-1 items-center"
                  >
                    {fromDelegate.slice(0, 6) + "..." + fromDelegate.slice(-4)}
                    <HiOutlineExternalLink size={14} />
                  </Link>
                )}
              </div>
            </div>
            <div className="w-full border-[0.5px] border-white flex items-center justify-center h-0">
              {/* <div className='rounded-full size-14 border-[5px] border-white flex items-center justify-center z-50 bg-[#F4F4F4]'><IoArrowDown className='text-black size-7 hover:text-blue-shade-100'/></div> */}
              <div className="border-[5px] border-white rounded-full size-12 xs:size-14">
                <Image
                  src={isHovering ? Arrow2 : Arrow1}
                  alt=""
                  className="w-full h-full z-50" // Adjust the size as needed
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                />
              </div>
            </div>
            <div className="flex items-center rounded-3xl border-[2.5px] border-white bg-[#F4F4F4] pb-4 xs:pb-5 pt-4">
              <Image
                src={displayImage}
                alt=""
                width={46}
                height={46}
                className="size-10 mx-5 rounded-full"
              />
              <div className="">
                <p className=" text-sm font-medium"> Delegating to</p>
                <p className=" font-normal text-[12px]">{delegateName}</p>
              </div>
            </div>
          </div>
          {daoName === "optimism" && (
            <>
              <div className="flex flex-col items-center w-full max-w-md bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-3xl px-4 0.7xs:px-6 py-4 mt-4 shadow-md">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-center">
                    <span className="text-black font-medium text-xs 0.7xs:text-sm tracking-wide uppercase mb-2">
                      Current CPI
                    </span>
                    <div className="text-lg font-semibold text-black bg-white px-3 py-1 rounded-lg">
                      {actualCpi !== null && actualCpi !== undefined ? (
                        Number(actualCpi).toFixed(2)
                      ) : (
                        <ThreeDots
                          visible={true}
                          height="30"
                          width="40"
                          color="black"
                          ariaLabel="loading"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-black font-medium text-xs 0.7xs:text-sm tracking-wide uppercase mb-2">
                      CPI if you delegate
                    </span>
                    <div
                      className={`${
                        tempCpi !== null &&
                        tempCpi !== undefined &&
                        Number(tempCpi?.toFixed(2)) <=
                          Number(actualCpi?.toFixed(2))
                          ? "text-[#1c8e1c]"
                          : "text-red-600"
                      } text-lg font-semibold bg-white px-3 py-1 rounded-lg`}
                    >
                      {/* {!tempCpiCalling && tempCpi !== null && tempCpi !== undefined ? (
                      Number(tempCpi).toFixed(2)
                    ) : (
                      <span className="text-gray-500 italic">
                        <ThreeDots
                          visible={true}
                          height="30"
                          width="40"
                          color="black"
                          ariaLabel="loading"
                        />
                      </span>
                    )} */}
                      {tempCpiCalling ? (
                        <ThreeDots
                          visible={true}
                          height="30"
                          width="40"
                          color="black"
                          ariaLabel="loading"
                        />
                      ) : tempCpi !== null && tempCpi !== undefined ? (
                        Number(tempCpi).toFixed(2)
                      ) : (
                        <span>0.00</span>
                      )}
                    </div>
                  </div>
                </div>
                {(tempCpi !== null && tempCpi !== undefined && tempCpi !== 0) && (actualCpi !== null && actualCpi !== undefined && actualCpi !== 0) ? (  
                  <div className="mt-4 text-sm font-medium text-gray-700">
                    Data for calculating CPI updates every 5 minutes.
                  </div>
                ) : (
                  <></>
                )}
              </div>
              {!tempCpiCalling &&
                (tempCpi === null || tempCpi === undefined || actualCpi === null || actualCpi === undefined) && (
                  <div className="text-red-500 italic mt-2 text-center text-sm">
                    We are working on getting the accurate CPI! Stay tuned.
                  </div>
                )}
            </>
            // <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4 max-w-md text-sm sm:text-base">
            //   <p className="font-bold">Alert:</p>
            //   <p>
            //     API to get the Actual CPI & Temp CPI is under maintenance. It
            //     will be live soon.🚀
            //   </p>
            // </div>
          )}
          <button
            className={`rounded-full py-3 xs:py-5 font-semibold font-poppins w-full text-base mt-4 ${
              addressCheck
                ? "bg-grey-shade-50 text-grey"
                : "bg-black text-white hover:bg-blue-shade-100"
            } ${delegatingToAddr ? "bg-blue-shade-100" : ""}`}
            onClick={handleDelegateVotes}
            disabled={addressCheck || delegatingToAddr}
          >
            {addressCheck ? (
              "You cannot delegate to the same address again"
            ) : delegatingToAddr ? (
              <div className="flex items-center justify-center">
                Delegating your tokens...
              </div>
            ) : (
              "Delegate"
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default DelegateTileModal;
