import React, { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import img1 from "@/assets/images/daos/thumbnail1.png";
import logo from "@/assets/images/daos/CCLogo.png";
import styles from "./OfficeHours.module.css";
import { FaGift, FaPencil } from "react-icons/fa6";
import { Clock, Edit2, Play, Trash2 } from "lucide-react";
import { Tooltip } from "@nextui-org/react";
import { IoCopy } from "react-icons/io5";
import user from "@/assets/images/user/user1.svg";
import op from "@/assets/images/daos/op.png";
import arb from "@/assets/images/daos/arb.png";
import { LuDot } from "react-icons/lu";
import { BiLinkExternal } from "react-icons/bi";
import buttonStyles from "./Button.module.css";
import { Attendee, OfficeHoursProps, TimeSlot } from "@/types/OfficeHoursTypes";
import EditOfficeHoursModal from "./EditOfficeHoursModal";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { getAccessToken } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import toast from "react-hot-toast";
import { TailSpin } from "react-loader-spinner";
import ClaimButton from "./ClaimButton";
import Link from "next/link";
import DeleteOfficeHoursModal from "./DeleteOfficeHoursModal";
import { formatTimeAgo } from "@/utils/getRelativeTime";
import { useRouter } from "next-nprogress-bar";
import { MEETING_BASE_URL } from "@/config/constants";
import { Oval } from "react-loader-spinner";
import oplogo from "@/assets/images/daos/op.png";
import arblogo from "@/assets/images/daos/arbitrum.jpg";
import OffchainAttestationButton from "./OffchainAttestationButton";
import { DAOLogo } from "../DAOs/DAOlogos";
import { daoConfigs } from "@/config/daos";
interface CopyStates {
  [key: number]: boolean;
}
interface OfficeHoursTileProps {
  isHosted?: boolean;
  isAttended?: boolean;
  isUpcoming?: boolean;
  isOngoing?: boolean;
  isUserProfile?: boolean;
  isRecorded?: boolean;
  data: OfficeHoursProps[];
}

const OfficeHourTile = ({
  isHosted,
  isAttended,
  isUpcoming,
  isOngoing,
  isUserProfile,
  isRecorded,
  data,
}: OfficeHoursTileProps) => {
  const [localData, setLocalData] = useState<OfficeHoursProps[]>(data);
  const [copyStates, setCopyStates] = useState<CopyStates>({});
  const { walletAddress } = useWalletAddress();
  const [loadingButton, setLoadingButton] = useState("");
  const [AttestationURL, setAttestationURL] = useState("");
  const [claimInProgress, setClaimInProgress] = useState(false);
  const [claimingMeetingId, setClaimingMeetingId] = useState(null);
  const [editModalData, setEditModalData] = useState<{
    isOpen: boolean;
    itemData: OfficeHoursProps | null;
  }>({
    isOpen: false,
    itemData: null,
  });
  const [deleteModalData, setDeleteModalData] = useState<{
    isOpen: boolean;
    itemData: OfficeHoursProps | null;
  }>({
    isOpen: false,
    itemData: null,
  });
  const [loadingStates, setLoadingStates] = useState(
    Object.fromEntries(data.map((item) => [item.meetingId, false]))
  );
  const router = useRouter();

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleClaimStart = (meetingId: any) => {
    setClaimInProgress(true);
    setClaimingMeetingId(meetingId);
  };

  const handleClaimEnd = () => {
    setClaimInProgress(false);
    setClaimingMeetingId(null);
  };

  const handleCopy = async (
    address: string,
    index: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopyStates((prev) => ({ ...prev, [index]: true }));

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopyStates((prev) => ({ ...prev, [index]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleEditModalOpen = (itemData: OfficeHoursProps) => {
    setEditModalData({
      isOpen: true,
      itemData,
    });
  };

  const handleEditModalClose = () => {
    setEditModalData({
      isOpen: false,
      itemData: null,
    });
  };

  const handleDeleteModalOpen = (itemData: OfficeHoursProps) => {
    setDeleteModalData({
      isOpen: true,
      itemData,
    });
  };

  const handleDeleteModalClose = () => {
    setDeleteModalData({
      isOpen: false,
      itemData: null,
    });
  };

  const handleUpdate = (updatedData: TimeSlot) => {
    setLocalData((prevData) =>
      prevData.map((item) => {
        if (item.reference_id === updatedData.reference_id) {
          return {
            ...item,
            title: updatedData.bookedTitle
              ? updatedData.bookedTitle
              : item.title,
            description: updatedData.bookedDescription
              ? updatedData.bookedDescription
              : item.description,
          };
        }
        return item;
      })
    );
    handleEditModalClose();
  };

  const handleDeleteSuccess = () => {
    // Remove the deleted item from localData
    if (deleteModalData.itemData) {
      setLocalData((prevData) =>
        prevData.filter(
          (item) => item.reference_id !== deleteModalData.itemData?.reference_id
        )
      );
    }
  };

  const handleStartSession = (meetingId: string) => {
    setLoadingStates((prev: any) => ({ ...prev, [meetingId]: true }));

    // Open the meeting in a new tab
    window.open(`${MEETING_BASE_URL}/meeting/officehours/${meetingId}/lobby`, '_blank');

    // Reset loading state after a short delay.  Adjust the delay as necessary
    setTimeout(() => {
      setLoadingStates((prev: any) => ({ ...prev, [meetingId]: false }));
    }, 500); // Adjust the time (milliseconds) as needed.
  };
//   const handleJoinMeeting = (meetingId: string) => {
//     window.open(`${MEETING_BASE_URL}/meeting/officehours/${meetingId}/lobby`, '_blank');
// };

  type DaoName = "optimism" | "arbitrum";
  const daoLogos: Record<DaoName, StaticImageData> = {
    optimism: oplogo,
    arbitrum: arblogo,
  };
  const getDaoLogo = (daoName: string): StaticImageData => {
    const normalizedName = daoName.toLowerCase() as DaoName;
    return daoLogos[normalizedName] || arblogo;
  };

  const getAttendeeUid = (address: string | null, attendees?: Attendee[]) => {
    if (!attendees || !address) return null;
    const attendee = attendees.find(
      (a) => a.attendee_address.toLowerCase() === address.toLowerCase()
    );
    return attendee?.attendee_uid;
  };

  // const getAttestationUrl = (daoName: string, uid?: string | null): string => {
  //   if (!uid) return "#";
  //   const baseUrl =
  //     daoName.toLowerCase() === "optimism"
  //       ? "https://optimism.easscan.org/offchain/attestation/view/"
  //       : daoName.toLowerCase() === "arbitrum"
  //       ? "https://arbitrum.easscan.org/offchain/attestation/view/"
  //       : "#";

  //   return `${baseUrl}${uid}`;
  // };

  const handleAttestationSuccess = (
    uid: string,
    meetingId: string | undefined
  ) => {
    setLocalData((prevData) =>
      prevData.map((item) => {
        if (item.meetingId === meetingId) {
          if (isAttended) {
            return {
              ...item,
              attendees:
                item.attendees?.map((attendee) =>
                  attendee.attendee_address.toLowerCase() ===
                  walletAddress?.toLowerCase()
                    ? { ...attendee, attendee_uid: uid }
                    : attendee
                ) || [],
            };
          } else if (isHosted) {
            return {
              ...item,
              uid_host: uid,
            };
          }
        }
        return item;
      })
    );
  };

  return (
    <div
      className={`grid min-[475px]:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-10 py-8 font-poppins`}
    >
      {localData.map((data: OfficeHoursProps, index: number) => (
        <div
          className={`border border-[#D9D9D9] sm:rounded-3xl ${
            isRecorded ? "cursor-pointer" : ""
          }`}
          key={index}
          onClick={() => {
            isRecorded && router.push(`/watch/${data.meetingId}`);
          }}
        >
          <div
            className={`w-full h-44 sm:rounded-t-3xl bg-black object-cover object-center relative `}
          >
            <Image
              src={`https://gateway.lighthouse.storage/ipfs/${data.thumbnail_image}`}
              alt=""
              width={200}
              height={200}
              className="w-full h-44 rounded-t-3xl object-cover"
            />
            <div className="absolute top-2 right-2 bg-black rounded-full">
              <Image
                src={logo}
                alt="image"
                width={100}
                height={100}
                className="w-7 h-7"
              />
            </div>
            <div className={`absolute top-2 left-2 bg-black rounded-full`}>
              <Image
                src={daoConfigs[data.dao_name.toLowerCase()].logo}
                alt="image"
                width={100}
                height={100}
                className="size-4 sm:size-6 rounded-full"
              />
              {/* <DAOLogo
                daoName={data.dao_name}
                width={100}
                height={100}
                className="size-4 sm:size-6 rounded-full"
              /> */}
            </div>
          </div>
          <div className="px-5 py-4 space-y-2">
            {/* Title with gradient underline animation */}
            <div className="group">
              <h3 className="text-sm sm:text-base font-semibold line-clamp-1">
                {data.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2">
              {data.description}
            </p>

            {(isAttended || isHosted || isRecorded) && (
              <div className="flex items-center text-sm gap-0.5 sm:gap-1 py-1">
                <div className=" flex items-center ">
                  <div>
                    <Image
                      src={daoConfigs[data.dao_name.toLowerCase()].logo}
                      alt="image"
                      width={100}
                      height={100}
                      className="rounded-full size-4 sm:size-6"
                    />
                    {/* <DAOLogo
                      daoName={data.dao_name}
                      width={100}
                      height={100}
                      className="rounded-full size-4 sm:size-6"
                    /> */}
                  </div>
                </div>
                <LuDot />
                <div className="text-xs sm:text-sm capitalize">
                  {data.views ?? 0} views
                </div>
                <LuDot />
                <div className=" text-xs sm:text-sm">
                  {formatTimeAgo(data.startTime)}
                </div>
              </div>
            )}

            {/* Host address */}
            <div className="flex items-center space-x-2">
              <Image
                src={user}
                alt=""
                className="rounded-full size-4 sm:size-5"
              />
              <span className="font-medium text-sm">Host:</span>
              <Link
                href={`/${data.dao_name}/${data.host_address}?active=info`}
                passHref
                onClick={(event: any) => {
                  event.stopPropagation();
                }}
              >
                <span
                  className="text-sm font-medium hover:text-blue-shade-200 cursor-pointer"
                  title={data.host_address}
                >
                  {truncateAddress(data.host_address)}
                </span>
              </Link>
              <Tooltip
                content={copyStates[index] ? "Copied!" : "Copy"}
                placement="right"
                closeDelay={0}
                showArrow
              >
                <span className="cursor-pointer text-xs sm:text-sm">
                  <IoCopy
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(data.host_address, index, e);
                    }}
                    className={`transition-colors duration-300 ${
                      copyStates[index]
                        ? "text-blue-500"
                        : "hover:text-blue-500"
                    }`}
                  />
                </span>
              </Tooltip>
            </div>

            {isAttended && data.isEligible && (
              <div className="px-4 pb-2 flex justify-center space-x-2">
                {/* Check if data.host_uid exists */}
                <OffchainAttestationButton
                  meetingId={data.meetingId}
                  daoName={data.dao_name}
                  meetingType={data.meetingType}
                  startTime={data.meeting_starttime}
                  endTime={data.meeting_endtime}
                  uid={getAttendeeUid(walletAddress, data.attendees)}
                  attendeeAddress={walletAddress}
                  onSuccess={(uid) =>
                    handleAttestationSuccess(uid, data.meetingId)
                  }
                  meetingData={data}
                />

                {/* ClaimButton Component */}
                <Tooltip content="Claim Onchain" placement="top" showArrow>
                  <ClaimButton
                    meetingId={data.meetingId as string}
                    meetingType={data.meetingType}
                    startTime={data.meeting_starttime}
                    endTime={data.meeting_endtime}
                    dao={data.dao_name}
                    address={walletAddress || ""}
                    onChainId={
                      data.onchain_host_uid ? data.onchain_host_uid : ""
                    }
                    disabled={
                      claimInProgress && claimingMeetingId !== data.meetingId
                    }
                    reference_id={data.reference_id}
                    meetingCategory="officehours"
                    attendees={
                      data.attendees ? data.attendees[0].attendee_address : ""
                    }
                    onClaimStart={() => handleClaimStart(data.meetingId)}
                    onClaimEnd={handleClaimEnd}
                  />
                </Tooltip>
              </div>
            )}

            {isHosted && (
              <div className="flex justify-end w-full">
                {data.isEligible && (
                  <div className="flex justify-center space-x-2 w-full">
                    {/* Check if data.host_uid exists */}
                    <OffchainAttestationButton
                      meetingId={data.meetingId}
                      daoName={data.dao_name}
                      meetingType={data.meetingType}
                      startTime={data.meeting_starttime}
                      endTime={data.meeting_endtime}
                      uid={data.uid_host}
                      isHost={true}
                      onSuccess={(uid) =>
                        handleAttestationSuccess(uid, data.meetingId)
                      }
                      meetingData={data}
                    />

                    {/* ClaimButton Component */}
                    <Tooltip content="Claim Onchain" placement="top" showArrow>
                      <ClaimButton
                        meetingId={data.meetingId as string}
                        meetingType={data.meetingType}
                        startTime={data.meeting_starttime}
                        endTime={data.meeting_endtime}
                        dao={data.dao_name}
                        address={walletAddress || ""}
                        onChainId={
                          data.onchain_host_uid ? data.onchain_host_uid : ""
                        }
                        disabled={
                          claimInProgress &&
                          claimingMeetingId !== data.meetingId
                        }
                        meetingCategory="officehours"
                        reference_id={data.reference_id}
                        onClaimStart={() => handleClaimStart(data.meetingId)}
                        onClaimEnd={handleClaimEnd}
                      />
                    </Tooltip>
                  </div>
                )}
                <div className="flex justify-end ms-2">
                  <Tooltip content="Edit Details" placement="top" showArrow>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditModalOpen(data);
                      }}
                      className={`bg-gradient-to-r from-[#8d949e] to-[#555c6629] rounded-full p-1 py-3 cursor-pointer w-10 flex items-center justify-center font-semibold text-sm text-black`}
                    >
                      <FaPencil color="black" size={14} />
                    </div>
                  </Tooltip>
                </div>
              </div>
            )}

            {/* {isHosted && (
              <div className="flex justify-end w-full">
                <Tooltip content="Edit Details" placement="top" showArrow>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditModalOpen(data);
                    }}
                    className={`bg-gradient-to-r from-[#8d949e] to-[#555c6629] rounded-full p-1 py-3 cursor-pointer w-10 flex items-center justify-center font-semibold text-sm text-black`}
                  >
                    <FaPencil color="black" size={14} />
                  </div>
                </Tooltip>
              </div>
            )} */}

            {(isUpcoming || isOngoing) && (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium">Starts at:</span>
                  <span className="text-indigo-600 font-semibold">
                    {`${new Date(data.startTime)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                      .replace(/\//g, "/")}, ${new Date(
                      data.startTime
                    ).toLocaleString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}`}
                  </span>
                </div>

                {isUserProfile && (
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditModalOpen(data);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteModalOpen(data)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        data.meetingId && handleStartSession(data.meetingId)
                      }
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      {data.meetingId && loadingStates[data.meetingId] ? (
                        <Oval
                          visible={true}
                          height="20"
                          width="20"
                          color="#fff"
                          secondaryColor="#cdccff"
                          ariaLabel="oval-loading"
                        />
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Start Meeting</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
            {isOngoing && (
              <button
                onClick={() =>{
                  data.meetingId && handleStartSession(data.meetingId);
                  // data.meetingId && handleJoinMeeting(data.meetingId);
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02]"
              >
                {data.meetingId && loadingStates[data.meetingId] ? (
                  <Oval
                    visible={true}
                    height="20"
                    width="20"
                    color="#fff"
                    secondaryColor="#cdccff"
                    ariaLabel="oval-loading"
                  />
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Join Meeting</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ))}

      {editModalData.isOpen && editModalData.itemData && (
        <EditOfficeHoursModal
          slot={{
            reference_id: editModalData.itemData.reference_id,
            bookedTitle: editModalData.itemData.title,
            bookedDescription: editModalData.itemData.description,
            startTime: new Date(
              editModalData.itemData.startTime
            ).toLocaleTimeString(),
            endTime: new Date(
              editModalData.itemData.endTime
            ).toLocaleTimeString(),
          }}
          date={new Date(editModalData.itemData.startTime)}
          onClose={handleEditModalClose}
          onUpdate={handleUpdate}
          hostAddress={editModalData.itemData.host_address}
          daoName={editModalData.itemData.dao_name}
        />
      )}
      {deleteModalData.isOpen && deleteModalData.itemData && (
        <DeleteOfficeHoursModal
          isOpen={deleteModalData.isOpen}
          onClose={handleDeleteModalClose}
          onSuccess={handleDeleteSuccess}
          hostAddress={deleteModalData.itemData.host_address}
          daoName={deleteModalData.itemData.dao_name}
          slotId={deleteModalData.itemData.reference_id}
        />
      )}
    </div>
  );
};

export default OfficeHourTile;