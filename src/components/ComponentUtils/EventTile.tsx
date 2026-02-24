"use client";

import React, { useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import {
  FaCircleCheck,
  FaCircleXmark,
  FaCirclePlay,
  FaPlay,
  FaXmark,
} from "react-icons/fa6";
import { Tooltip } from "@nextui-org/react";
import { Oval } from "react-loader-spinner";
// import { useRouter } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import Link from "next/link";
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";
import oplogo from "@/assets/images/daos/op.png";
import arblogo from "@/assets/images/daos/arbitrum.jpg";
import logo from "@/assets/images/daos/CCLogo.png";
import user1 from "@/assets/images/user/user1.svg";
import { BsPersonVideo3 } from "react-icons/bs";
import { fetchEnsNameAndAvatar } from "@/utils/ENSUtils";
import styles from "./Button.module.css";
import { useDisclosure } from "@nextui-org/react";
import { IoCopy } from "react-icons/io5";
import { useAccount } from "wagmi";
import { SessionInterface } from "@/types/MeetingTypes";
import { MEETING_BASE_URL } from "@/config/constants";
import { fetchApi } from "@/utils/api";
import { usePrivy } from "@privy-io/react-auth";
import { daoConfigs } from "@/config/daos";
import { Play, Trash2 } from "lucide-react";
import { useConnection } from "@/app/hooks/useConnection";

type Attendee = {
  attendee_address: string;
  attendee_uid?: string; // Making attendee_uid optional
};

interface TileProps {
  tileIndex: number;
  data: SessionInterface;
  isEvent: string;
}

type DaoName = "optimism" | "arbitrum";
const daoLogos: Record<DaoName, StaticImageData> = {
  optimism: oplogo,
  arbitrum: arblogo,
};

const getDaoLogo = (daoName: string): StaticImageData => {
  const normalizedName = daoName.toLowerCase() as DaoName;
  return daoLogos[normalizedName] || arblogo;
};

function EventTile({ tileIndex, data: initialData, isEvent }: TileProps) {
  const [data, setData] = useState(initialData);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isConfirmSlotLoading, setIsConfirmSlotLoading] = useState(false);
  const router = useRouter();
  const [startLoading, setStartLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rejectionReason, setRejectionReason] = useState("");
  const [ensHostName, setEnsHostName] = useState("");
  const [ensGuestName, setEnsGuestName] = useState("");
  const [ensHostAvatar, setEnsHostAvatar] = useState("");
  const [ensGuestAvatar, setEnsGuestAvatar] = useState("");
  const [loadingEnsData, setLoadingEnsData] = useState(true);
  const { address } = useAccount();
  const { isConnected } = useConnection();
  const { user, ready, getAccessToken, authenticated } = usePrivy();
  // const address = "0xB351a70dD6E5282A8c84edCbCd5A955469b9b032";
  const [tooltipContent, setTooltipContent] = useState("Copy");
  const [isAnimating, setIsAnimating] = useState(false);
  const [copyStates, setCopyStates] = useState({
    host: { isAnimating: false, tooltipContent: "Copy" },
    guest: { isAnimating: false, tooltipContent: "Copy" },
  });
  const handleCopy = (addr: string, type: "host" | "guest") => {
    copy(addr);

    setCopyStates((prev) => ({
      ...prev,
      [type]: { isAnimating: true, tooltipContent: "Copied" },
    }));

    setTimeout(() => {
      setCopyStates((prev) => ({
        ...prev,
        [type]: { isAnimating: false, tooltipContent: "Copy" },
      }));
    }, 4000);
  };

  useEffect(() => {
    const fetchEnsData = async () => {
      try {
        setLoadingEnsData(true);

        // Fetch host ENS data
        const hostEnsData = await fetchEnsNameAndAvatar(
          data.host_address.toLowerCase()
        );
        setEnsHostName(
          hostEnsData?.ensName || formatWalletAddress(data.host_address)
        );
        setEnsHostAvatar(hostEnsData?.avatar || "");

        // Fetch guest ENS data if available
        if (data.attendees[0]?.attendee_address) {
          const guestEnsData = await fetchEnsNameAndAvatar(
            data.attendees[0].attendee_address.toLowerCase()
          );
          setEnsGuestName(
            guestEnsData?.ensName ||
            formatWalletAddress(data.attendees[0].attendee_address)
          );
          setEnsGuestAvatar(guestEnsData?.avatar || "");
        }
      } catch (error) {
        console.error("Error fetching ENS data:", error);
      } finally {
        setLoadingEnsData(false);
      }
    };

    if (address && isConnected) {
      fetchEnsData();
    }
  }, [data.host_address, data.attendees[0]?.attendee_address]);

  useEffect(() => {
    setIsPageLoading(false);
    // setIsConfirmSlotLoading(false);
  }, [data, isPageLoading]);

  const formatWalletAddress = (address: any) => {
    if (typeof address !== "string" || address.length <= 10) return address;
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  const formatSlotTimeToLocal = (slotTime: any) => {
    const date = new Date(slotTime);
    return date.toLocaleString();
  };

  const confirmSlot = async (data: SessionInterface, status: any) => {
    const id = data._id;
    const host_address = data.host_address;
    const attendee_address = data.attendees[0]?.attendee_address;
    setStartLoading(true);
    try {
      setIsConfirmSlotLoading(true);
      let roomId = null;
      let meeting_status = null;
      let host_joined_status;
      let attendee_joined_status;
      if (status === "Rejected") {
        meeting_status = "Denied";
        host_joined_status = "Not Joined";
        attendee_joined_status = "Not Joined";
      }

      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(address && {
          "x-wallet-address": address,
          Authorization: `Bearer ${token}`,
        }),
      };

      const raw = await JSON.stringify({
        id: id,
        meeting_status: meeting_status,
        booking_status: status,
        meetingId: roomId,
        rejectionReason: rejectionReason,
        title: data.title,
        slot_time: data.slot_time,
        dao_name: data.dao_name,
        attendee_joined_status: attendee_joined_status,
        host_joined_status: host_joined_status,
        host_address,
        attendee_address,
      });

      const requestOptions = await {
        method: "PUT",
        headers: myHeaders,
        body: raw,
      };
      const response = await fetchApi(
        "/book-slot/update-slot/",
        requestOptions
      );
      const result = await response.json();
      if (result.success) {
        toast(`You ${status} the booking.`);
        setData((prevData: any) => ({
          ...prevData,
          booking_status: status,
          meeting_status: meeting_status,
        }));
        setStartLoading(false);
        setIsConfirmSlotLoading(false);
        onClose();
      }
    } catch (error) {
      // setIsConfirmSlotLoading(false);
      console.error(error);
    } finally {
      setStartLoading(false);
      setIsConfirmSlotLoading(false);
    }
  };

  const handleJoinClick = () => {
    const currentTime = new Date();
    const slotTime = new Date(data.slot_time);

    const currentTimestamp = currentTime.getTime();
    const slotTimestamp = slotTime.getTime();

    const timeDifference = slotTimestamp - currentTimestamp;

    if (timeDifference <= 300000) {
      setStartLoading(true);
      router.push(
        `${MEETING_BASE_URL}/meeting/session/${data.meetingId}/lobby`
      );
    } else {
      toast.error(
        "The meeting can only be started 5 minutes before the meeting time."
      );
    }
  };

  const handleOpenInNewTab = () => {
    setStartLoading(true); // Start loading

    const currentTime = new Date();
    const slotTime = new Date(data.slot_time);
    const currentTimestamp = currentTime.getTime();
    const slotTimestamp = slotTime.getTime();
    const timeDifference = slotTimestamp - currentTimestamp;

    if (timeDifference <= 300000) {
      window.open(
        `${MEETING_BASE_URL}/meeting/session/${data.meetingId}/lobby`,
        "_blank"
      );
    } else {
      toast.error(
        "The meeting can only be started 5 minutes before the meeting time."
      );
    }
    setStartLoading(false); // Stop loading
  };

  return (
    <>
      <div key={tileIndex} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[24px] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group flex flex-col h-full shadow-xl">
        <div className="w-full h-44 bg-black/40 object-cover object-center relative overflow-hidden">
          <Image
            src={`https://gateway.lighthouse.storage/ipfs/${data.thumbnail_image}`}
            alt="image"
            fill
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-3 right-3">
            <div
              className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest backdrop-blur-md border ${data.booking_status === "Approved"
                ? "bg-lime-500/20 border-lime-500/30 text-lime-400"
                : data.booking_status === "Rejected"
                  ? "bg-red-500/20 border-red-500/30 text-red-400"
                  : "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
                }`}
            >
              {data.booking_status}
            </div>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-4 mb-3">
            <h3 className="text-white font-bold text-base leading-tight font-robotoMono group-hover:text-primary transition-colors line-clamp-2">
              {data.title}
            </h3>
          </div>

          <p className="text-white/40 text-xs line-clamp-2 mb-4 leading-relaxed">
            {data.description}
          </p>

          <div className="mt-auto space-y-4">
            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center gap-2 text-white/60 mb-3 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-xs font-bold font-robotoMono">
                  {formatSlotTimeToLocal(data.slot_time)}
                </span>
              </div>

              <div className="space-y-2.5">
                {data.session_type === "session" ? (
                  <div className="text-white/50 text-xs flex items-center gap-2.5 bg-white/5 p-2 rounded-xl border border-white/5">
                    <Image
                      src={ensGuestAvatar || user1}
                      alt="image"
                      width={24}
                      height={24}
                      className="size-5 rounded-full object-cover border border-white/10"
                    />
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-white/30 whitespace-nowrap">Guest:</span>
                      <span className="truncate">
                        {loadingEnsData
                          ? formatWalletAddress(data.attendees[0].attendee_address)
                          : ensGuestName}
                      </span>
                      <Tooltip
                        content={copyStates.guest.tooltipContent}
                        placement="right"
                        closeDelay={1}
                        showArrow
                        className="bg-black text-white text-[10px]"
                      >
                        <button
                          className={`p-1 rounded-md transition-colors ${copyStates.guest.isAnimating ? "text-primary bg-primary/10" : "text-white/20 hover:text-white/60 hover:bg-white/10"}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCopy(data.attendees[0].attendee_address, "guest");
                          }}
                        >
                          <IoCopy size={12} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ) : (
                  <div className="text-primary font-bold text-[10px] uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 w-fit">
                    Instant Meet
                  </div>
                )}

                <div className="text-white/50 text-xs flex items-center gap-2.5 bg-white/5 p-2 rounded-xl border border-white/5">
                  <Image
                    src={ensHostAvatar || user1}
                    alt="image"
                    width={24}
                    height={24}
                    className="size-5 rounded-full object-cover border border-white/10"
                  />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-white/30 whitespace-nowrap">Host:</span>
                    <span className="truncate">
                      {isEvent === "Attending" ? (
                        <Link href={`/user/${data.host_address}?active=info`}>
                          <span className="hover:text-primary transition-colors duration-200">
                            {loadingEnsData
                              ? formatWalletAddress(data.host_address)
                              : ensHostName}
                          </span>
                        </Link>
                      ) : (
                        <span>
                          {loadingEnsData
                            ? formatWalletAddress(data.host_address)
                            : ensHostName}
                        </span>
                      )}
                    </span>
                    <Tooltip
                      content={copyStates.host.tooltipContent}
                      placement="right"
                      closeDelay={1}
                      showArrow
                      className="bg-black text-white text-[10px]"
                    >
                      <button
                        className={`p-1 rounded-md transition-colors ${copyStates.host.isAnimating ? "text-primary bg-primary/10" : "text-white/20 hover:text-white/60 hover:bg-white/10"}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleCopy(data.host_address, "host");
                        }}
                      >
                        <IoCopy size={12} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              {isEvent === "Book" ? (
                data.booking_status === "Approved" ? (
                  <div className="flex gap-2 w-full">
                    {startLoading || isConfirmSlotLoading ? (
                      <div className="flex items-center justify-center w-full py-2.5">
                        <Oval
                          visible={true}
                          height="24"
                          width="24"
                          color="#3b82f6"
                          secondaryColor="#1d4ed8"
                          ariaLabel="oval-loading"
                        />
                      </div>
                    ) : (
                      <button
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-accent rounded-xl transition-all duration-300 transform group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] shadow-lg shadow-primary/20"
                        onClick={() => {
                          setStartLoading(true);
                          const meetingUrl = `${MEETING_BASE_URL}/meeting/session/${data.meetingId}/lobby`;
                          window.open(meetingUrl, "_blank");
                          setStartLoading(false);
                        }}
                      >
                        <Play size={14} fill="currentColor" />
                        <span>START</span>
                      </button>
                    )}
                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300"
                      onClick={onOpen}
                    >
                      <span>REJECT</span>
                      <Trash2 size={14} />
                    </button>

                    {isOpen && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
                        <div className="relative bg-[#0F172A] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-300">
                          <div className="p-8 bg-gradient-to-b from-white/5 to-transparent">
                            <h2 className="text-xl font-bold text-white font-unbounded mb-6 uppercase tracking-wider">
                              Rejection Reason
                            </h2>
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">
                                  Your Message
                                </label>
                                <textarea
                                  name="rejectionReason"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Why are you rejecting this session?"
                                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all min-h-[120px] resize-none"
                                  required
                                />
                              </div>
                              <div className="flex gap-4">
                                <button
                                  className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10"
                                  onClick={onClose}
                                >
                                  CANCEL
                                </button>
                                <button
                                  className="flex-1 px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20"
                                  onClick={() => confirmSlot(data, "Rejected")}
                                >
                                  {startLoading ? (
                                    <Oval
                                      visible={true}
                                      height="20"
                                      width="20"
                                      color="white"
                                      secondaryColor="rgba(255,255,255,0.3)"
                                      ariaLabel="oval-loading"
                                    />
                                  ) : (
                                    "REJECT"
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null
              ) : isEvent === "Attending" ? (
                data.booking_status === "Approved" && (
                  <div className="w-full">
                    {startLoading ? (
                      <div className="flex justify-center items-center w-full py-2.5">
                        <Oval
                          visible={true}
                          height="24"
                          width="24"
                          color="#3b82f6"
                          secondaryColor="#1d4ed8"
                          ariaLabel="oval-loading"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={handleOpenInNewTab}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-white bg-primary hover:bg-primary-accent rounded-xl transition-all duration-300 transform group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] shadow-lg shadow-primary/20"
                      >
                        <BsPersonVideo3 size={14} />
                        <span>JOIN SESSION</span>
                      </button>
                    )}
                  </div>
                )
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EventTile;
