import React, { useState } from "react";
import Image from "next/image";
import styles from "../ComponentUtils/RecordedSessionsTile.module.css";
import logo from "@/assets/images/daos/CCLogo.png";
import { RiExternalLinkLine } from "react-icons/ri";
import Link from "next/link";
import oplogo from "@/assets/images/daos/op.png";
import arblogo from "@/assets/images/daos/arbitrum.jpg";
import { ImageOff } from "lucide-react";

interface NFTProps {
  nft: {
    id: any;
    thumbnail: any;
    contract: any;
    network: any;
    time: any;
    host: any;
  };
}

function NFTTile({ nft }: NFTProps) {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [imageLoadError, setImageLoadError] = useState(false);
  const cid = nft.thumbnail?.split("ipfs://")[1];
  const [isLoading, setIsLoading] = useState(true);

  const getDaoLogo = (network: string) => {

    // if(network==="arbitrum-sepolia"){
    //   const trimNetwork=network.split("-")[0];
    //   return daoConfigs[trimNetwork.toLowerCase()].logo;
    // }
    // else{
    //   return oplogo;
    // }

    if (network === "optimism") {
      return oplogo;
    } else {
      return arblogo;
    }
  };

  const sources = cid
    ? [
        `https://ipfs.io/ipfs/${cid}`,
        `https://gateway.lighthouse.storage/ipfs/${cid}`,
      ]
    : [];

  const handleError = () => {
    setIsLoading(false);
    if (currentSrcIndex < sources.length - 1) {
      setCurrentSrcIndex(currentSrcIndex + 1);
    } else {
      setImageLoadError(true);
    }
  };

  
  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="border border-[#D9D9D9] rounded-3xl ">
      <div className="w-full h-[180px] sm:h-56 rounded-t-3xl overflow-hidden relative">
        {cid && !imageLoadError ? (
          <>
           {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          <Image
            src={sources[currentSrcIndex]}
            alt={`NFT ${nft.id}`}
            height={800}
            width={1000}
            className={`rounded-t-3xl object-cover w-full h-[180px] sm:h-56 transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleError}
            onLoad={handleLoad}
          />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
            <ImageOff className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-gray-500 text-sm">Image Unavailable</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black rounded-full">
          <Image src={logo} alt="logo" width={24} height={24} />
        </div>
      </div>
      <div className="px-4 py-2">
        <div
          className={`text-sm sm:text-base font-semibold py-1 ${styles.truncate}`}
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 1,
          }}
        >
          <div className="flex items-center">
            <span className="flex-1 min-w-0 truncate">
              {nft.id.length > 20
                ? `NFT ${nft.id.slice(0, 20)}...`
                : `NFT ${nft.id}`}
            </span>
            <span className="mx-1 flex-shrink-0">
              <Link
                href={`https://sepolia.arbiscan.io/address/${nft.contract}`}
                target="_blank"
                className="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                <RiExternalLinkLine />
              </Link>
            </span>
          </div>
          <div className="flex items-center  text-sm">
            <Image
              src={getDaoLogo(nft.network)}
              alt="image"
              width={20}
              height={20}
              className="rounded-full size-4 sm:size-5"
            />
            <span className="mx-2">•</span>
            <span>{nft.time}</span>
          </div>
          <div className="text-sm text-gray-500">
            {nft && nft.host ? (
              <>
                Host :{" "}
                <Link
                  href={`/${
                    nft.network === "arbitrum-sepolia"
                      ? "arbitrum"
                      : nft.network
                  }/${nft.host}?active=info`}
                  onClick={(event: any) => {
                    event.stopPropagation();
                  }}
                  className="cursor-pointer hover:text-blue-shade-200 ml-1"
                >
                  <span>
                    {" "}
                    {nft.host.slice(0, 6)}...{nft.host.slice(-4)}
                  </span>
                </Link>
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NFTTile;
