import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import whatsapp from "@/assets/images/SocialMedia/Ellipse 216.svg";
import faceBook from "@/assets/images/SocialMedia/Ellipse 217.svg";
import appX from "@/assets/images/SocialMedia/Ellipse 218.svg";
import Image from "next/image";
import { IoCopy } from "react-icons/io5";
import { TbMailFilled } from "react-icons/tb";
import "./WatchSession.module.css";
import toast, { Toaster } from "react-hot-toast";
import { FaFacebook, FaTelegram } from "react-icons/fa";
import { FaXTwitter, FaWhatsapp } from "react-icons/fa6";
import { RiTwitterXLine } from "react-icons/ri";
import { useAccount } from "wagmi";
import { SiFarcaster } from "react-icons/si";
import { usePrivy } from "@privy-io/react-auth";

function ShareMediaModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}) {
  const toggleModal = () => {
    onClose();
  };

  const [link, setLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { address } = useAccount();


  useEffect(() => {
    setLink(`${window.location.href}${address ? `?referrer=${address}` : ""}`);
  }, [address]);

  useEffect(() => {
    // Lock scrolling when the modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const shareOnWhatsapp = () => {
    toast("Coming soon🚀");
  };
  const shareOnFacebook = () => {
    toast("Coming soon🚀");
  };
  const shareOnMail = () => {
    toast("Coming soon🚀");
  };

  const url = encodeURIComponent(link);

  const text = encodeURIComponent(
    `${data.title} ${decodeURIComponent(
      url
    )} via Xcan\n\n #session #growth`
  );

  const shareOnTwitter = () => {
    // Twitter share URL
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;

    // Open Twitter share dialog
    window.open(twitterUrl, "_blank");
  };

  const shareOnFarcaster = () => {
    const farcasterUrl = `https://warpcast.com/~/compose?text=${text}&embeds%5B%5D=${url}`;

    window.open(farcasterUrl, "_blank");
  };

  const shareOnTelegram = () => {
    const telegramUrl = `https://t.me/share/url?text=${text}&url=${url}`;

    window.open(telegramUrl, "_blank");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      toast("Copied!");
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50  overflow-hidden p-4">
        <div
          className="absolute inset-0 backdrop-blur-md"
          onClick={toggleModal}
        ></div>
        <div className="p-4 sm:p-5 border z-50 rounded-2xl bg-[#212c4c]  flex flex-col gap-2 sm:gap-3 relative w-full max-w-md mx-2 xm:mx-auto">
          <div className="bg-black rounded-full size-5 p-px flex justify-center items-center absolute top-5 right-5">
            <IoClose
              className="cursor-pointer w-5 h-5 text-white "
              onClick={toggleModal}
            />
          </div>

          <p className="flex items-center justify-center font-medium text-xl sm:text-2xl text-[28px]">
            Share
          </p>
          <div className="flex gap-3 sm:gap-4 justify-center items-center my-5">
            {/* <div
              className="bg-green-shade-200 rounded-full size-[72px]  flex justify-center items-center cursor-pointer"
              onClick={shareOnWhatsapp}
            >
              <FaWhatsapp className="text-white bg-green-shade-200 size-10 " />
            </div>
            <div onClick={shareOnFacebook}>
              <FaFacebook className="text-blue-shade-100 bg-white size-[72px] cursor-pointer" />
            </div> */}
            <div
              className="bg-black rounded-full size-14 sm:size-16 md:size-[72px]  flex justify-center items-center cursor-pointer"
              onClick={shareOnTwitter}
            >
              <RiTwitterXLine className="text-white bg-black size-8 sm:size-9 md:size-10 " />
            </div>
            <div onClick={shareOnFarcaster}>
              <SiFarcaster className="bg-white text-[#8a63d2] rounded-full size-14 sm:size-16 md:size-[72px] cursor-pointer" />
            </div>
            <div onClick={shareOnTelegram}>
              <FaTelegram className="text-[#1d98dc] bg-white rounded-full size-14 sm:size-16 md:size-[72px] cursor-pointer" />
            </div>
            {/* <div
              className="bg-black-shade-900 rounded-full size-[72px] p-3 flex justify-center items-center cursor-pointer"
              onClick={shareOnMail}
            >
              <TbMailFilled className="text-white size-8" />
            </div> */}
          </div>
          <div
            className={`bg-[#3843646b] rounded-lg py-2 sm:py-2.5 px-2 sm:px-3 flex justify-between items-center gap-2 sm:gap-4`}
          >
            <p className="text-xs sm:text-sm font-light truncate flex-1">{link}</p>
            <IoCopy
              className={`cursor-pointer ${copySuccess ? "text-blue-shade-100" : ""
                }`}
              onClick={handleCopy}
            />
          </div>
        </div>
      </div>
      {/* <Toaster
        toastOptions={{
          style: {
            fontSize: "14px",
            backgroundColor: "#3E3D3D",
            color: "#fff",
            boxShadow: "none",
            borderRadius: "50px",
            padding: "3px 5px",
          },
        }}
      /> */}
    </>
  );
}

export default ShareMediaModal;
