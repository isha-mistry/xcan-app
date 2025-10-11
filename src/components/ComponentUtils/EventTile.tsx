"use client";

import React, { useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import { FaCircleCheck, FaCircleXmark, FaCirclePlay, FaPlay, FaXmark } from "react-icons/fa6";
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
      <div key={tileIndex} className="border border-[#D9D9D9] sm:rounded-3xl">
        <div className="w-full h-44 rounded-t-3xl bg-black object-cover object-center relative">
          <Image
            src={`https://gateway.lighthouse.storage/ipfs/${data.thumbnail_image}`}
            alt="image"
            width={176}
            height={176}
            className="w-full h-44 sm:rounded-t-3xl object-cover"
          />
        </div>

        <div className="px-4 pt-2">
          <div className="flex justify-between gap-2">
            <div
              className={`text-sm sm:text-base font-semibold py-1`}
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {data.title}
            </div>
            <div
              className={`rounded-md px-2 py-0.5 w-fit flex items-center text-xs ${data.booking_status === "Approved"
                ? "border border-lime-600 text-lime-600"
                : data.booking_status === "Rejected"
                  ? "border border-red-600 text-red-600"
                  : "border border-yellow-500 text-yellow-500"
                }`}
            >
              {data.booking_status}
              {/* Approve */}
            </div>
          </div>
          <div className="text-gray-200 text-sm mt-0.5">
            {data.description}
          </div>
          <div className="py-1">
            <hr />
          </div>

          <div className="flex items-center text-sm gap-3 py-1">
            <div className="text-[#F5F5F5] text-sm sm:text-base py-0.5 sm:py-1 px-3 rounded-md flex items-center w-fit">
              {formatSlotTimeToLocal(data.slot_time)}
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm pt-1">
            {data.session_type === "session" ? (
              <div className="text-gray-300 text-xs sm:text-sm flex items-center gap-2">
                <Image
                  src={ensGuestAvatar || user1}
                  alt="image"
                  width={20}
                  height={20}
                  className="size-4 sm:size-5 rounded-full object-cover object-center"
                />
                <div className="flex items-center">
                  <span className="font-medium">Guest: </span> &nbsp;
                  {loadingEnsData
                    ? formatWalletAddress(data.attendees[0].attendee_address)
                    : ensGuestName}
                  &nbsp;
                  <Tooltip
                    content={copyStates.guest.tooltipContent}
                    placement="right"
                    closeDelay={1}
                    showArrow
                    className="bg-gray-700"
                  >
                    <span
                      className={`cursor-pointer text-xs sm:text-sm ${copyStates.guest.isAnimating
                        ? "text-blue-500"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      <IoCopy
                        onClick={(event) => {
                          event.stopPropagation();
                          handleCopy(
                            data.attendees[0].attendee_address,
                            "guest"
                          );
                        }}
                      />
                    </span>
                  </Tooltip>
                </div>
              </div>
            ) : (
              <div className="text-[#3E3D3D]">
                <span className="font-semibold">Instant Meet</span>{" "}
              </div>
            )}
            <div className="text-gray-300 text-xs sm:text-sm flex items-center gap-2">
              <Image
                src={ensHostAvatar || user1}
                alt="image"
                width={20}
                height={20}
                className="size-4 sm:size-5 rounded-full object-cover object-center"
              />
              <div className="flex items-center">
                <span className="font-medium">Host: </span> &nbsp;
                {isEvent === "Attending" ? (
                  <Link
                    href={`/user/${data.host_address}?active=info`}
                  >
                    <span className="hover:text-blue-shade-100 transition-colors duration-200">
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
                &nbsp;
                <Tooltip
                  content={copyStates.host.tooltipContent}
                  placement="right"
                  closeDelay={1}
                  showArrow
                  className="bg-gray-700"
                >
                  <span
                    className={`cursor-pointer text-xs sm:text-sm ${copyStates.host.isAnimating
                      ? "text-blue-500"
                      : "text-gray-400 hover:text-gray-600"
                      }`}
                  >
                    <IoCopy
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCopy(data.host_address, "host");
                      }}
                    />
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`flex flex-col justify-between text-xs sm:py-2 px-4 mb-2`}
        >
          {isEvent === "Book" ? (
            data.booking_status === "Approved" ? (
              <div className="flex gap-1 w-full mt-2">
                {startLoading || isConfirmSlotLoading ? (
                  <div className="flex items-center justify-center">
                    <Oval
                      visible={true}
                      height="30"
                      width="30"
                      color="#0500FF"
                      secondaryColor="#cdccff"
                      ariaLabel="oval-loading"
                    />
                  </div>
                ) : (
                  <Tooltip
                    content="Start Session"
                    placement="top"
                    closeDelay={1}
                    showArrow
                    className="bg-gray-700"
                  >
                    <div className={`flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer`} onClick={() => {
                      setStartLoading(true);
                      const meetingUrl = `${MEETING_BASE_URL}/meeting/session/${data.meetingId}/lobby`;
                      window.open(meetingUrl, "_blank");
                      setStartLoading(false);
                    }}>
                      <Play className="w-4 h-4" />
                      <span >Start</span>

                    </div>
                  </Tooltip>
                )}
                <Tooltip
                  content="Reject Session"
                  placement="top"
                  closeDelay={1}
                  showArrow
                  className="bg-gray-700"
                >
                  <div className={`flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100  transition-all  transform hover:scale-[1.02] cursor-pointer`} onClick={onOpen}>
                    <span>Reject</span>
                    <Trash2 className="w-4 h-4" />
                  </div>
                </Tooltip>
                {isOpen && (
                  <div className="font-tektur z-[70] fixed inset-0 flex items-center justify-center backdrop-blur-md">
                    <div className="bg-white rounded-[41px] overflow-hidden shadow-lg w-1/2">
                      <div className="relative">
                        <div className="flex flex-col gap-1 text-white bg-[#292929] p-4 py-7">
                          <h2 className="text-lg font-semibold mx-4">
                            Reason for Rejection
                          </h2>
                        </div>
                        <div className="px-8 py-4">
                          <div className="mt-4">
                            <label className="block mb-2 font-semibold">
                              Rejection Reason:
                            </label>
                            <textarea
                              name="rejectionReason"
                              value={rejectionReason}
                              onChange={(e) =>
                                setRejectionReason(e.target.value)
                              }
                              placeholder="Give a reason for rejecting the session"
                              className="w-full px-4 py-2 border rounded-xl bg-[#D9D9D945]"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex justify-end px-8 py-4">
                          <button
                            className="bg-gray-300 text-gray-700 px-8 py-3 font-semibold rounded-full mr-4"
                            onClick={onClose}
                          >
                            Cancel
                          </button>
                          <button
                            className="bg-red-500 text-white px-8 py-3 font-semibold rounded-full"
                            onClick={() => confirmSlot(data, "Rejected")}
                          >
                            {startLoading ? (
                              <Oval
                                visible={true}
                                height="20"
                                width="20"
                                color="black"
                                secondaryColor="#cdccff"
                                ariaLabel="oval-loading"
                              />
                            ) : (
                              "Reject"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null
          ) : isEvent === "Attending" ? (
            data.booking_status === "Approved" && (
              <div
                onClick={handleOpenInNewTab}
                className="text-center rounded-full font-bold text-white mt-2 text-xs cursor-pointer"
              >
                {startLoading ? (
                  <div
                    className="flex justify-center items-center w-full py-2 rounded-full"
                    style={{
                      background: "linear-gradient(45deg, #004DFF, #00A3FF)",
                    }}
                  >
                    <Oval
                      visible={true}
                      height="20"
                      width="20"
                      color="#fff"
                      secondaryColor="#cdccff"
                      ariaLabel="oval-loading"
                    />
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer`}
                  >
                    <BsPersonVideo3 className="w-4 h-4" />
                    <span >Join Session</span>
                    {/* <span className={styles.iconWrapper}> */}
                    {/* </span>/ */}
                  </div>
                )}
              </div>
            )
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
}

export default EventTile;
