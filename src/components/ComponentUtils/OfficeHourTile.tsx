import React, { useState } from "react";
import Image from "next/image";
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
import { OfficeHoursProps, TimeSlot } from "@/types/OfficeHoursTypes";
import EditOfficeHoursModal from "./EditOfficeHoursModal";
import DeleteOfficeHoursModal from "./DeleteOfficeHoursModal";
import { formatTimeAgo } from "@/utils/getRelativeTime";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { useRouter } from "next-nprogress-bar";
import { MEETING_BASE_URL } from "@/config/constants";
import { Oval } from "react-loader-spinner";
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
  const [startLoading, setStartLoading] = useState(false);
  const router = useRouter();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
            <div
              className={`${
                !isUpcoming ? "hidden" : ""
              } absolute top-2 left-2 bg-black rounded-full`}
            >
              <Image
                src={op}
                alt="image"
                width={100}
                height={100}
                className="w-6 h-6"
              />
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

            {(isAttended || isHosted) && (
              <div className="flex items-center text-sm gap-0.5 sm:gap-1 py-1">
                <div className=" flex items-center ">
                  <div>
                    <Image
                      src={op}
                      alt="image"
                      width={100}
                      height={100}
                      className="rounded-full size-4 sm:size-6"
                    />
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
              <span
                className="text-sm font-medium hover:text-blue-shade-200 cursor-pointer"
                title={data.host_address}
              >
                {truncateAddress(data.host_address)}
              </span>
              <Tooltip
                content={copyStates[index] ? "Copied!" : "Copy"}
                placement="right"
                closeDelay={0}
                showArrow
              >
                <span className="cursor-pointer text-xs sm:text-sm">
                  <IoCopy
                    onClick={(e) => handleCopy(data.host_address, index, e)}
                    className={`transition-colors duration-300 ${
                      copyStates[index]
                        ? "text-blue-500"
                        : "hover:text-blue-500"
                    }`}
                  />
                </span>
              </Tooltip>
            </div>

            {isAttended && (
              <div className="flex gap-2 w-full">
                <Tooltip content="Claim Offchain" placement="top" showArrow>
                  <div
                    className={`${buttonStyles.button} w-full gap-0.5 text-xs py-2.5`}
                  >
                    Offchain
                    <FaGift
                      size={14}
                      className="text-white hover:text-blue-600 transition-colors duration-200"
                      title="Open link in new tab"
                    />
                  </div>
                </Tooltip>
                <Tooltip content="Claim Onchain" placement="top" showArrow>
                  <div
                    className={`${buttonStyles.button} w-full gap-0.5 text-xs py-2.5`}
                  >
                    Onchain
                    <FaGift
                      size={14}
                      className="text-white hover:text-blue-600 transition-colors duration-200"
                      title="Open link in new tab"
                    />
                  </div>
                </Tooltip>
              </div>
            )}
            {isHosted && (
              <div className="flex justify-end w-full">
                <Tooltip content="Edit Details" placement="top" showArrow>
                  <div
                    onClick={() => handleEditModalOpen(data)}
                    className={`bg-gradient-to-r from-[#8d949e] to-[#555c6629] rounded-full p-1 py-3 cursor-pointer w-10 flex items-center justify-center font-semibold text-sm text-black`}
                  >
                    <FaPencil color="black" size={14} />
                  </div>
                </Tooltip>
              </div>
            )}

            {isUpcoming && (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium">Starts at:</span>
                  <span className="text-indigo-600 font-semibold">
                    {new Date(data.startTime).toLocaleString("en-GB")}
                  </span>
                </div>

                {isUserProfile && (
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                        onClick={() => handleEditModalOpen(data)}
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
                      onClick={() => {
                        setStartLoading(true);
                        router.push(
                          `${MEETING_BASE_URL}/meeting/officehours/${data.meetingId}/lobby`
                        );
                        // handleJoinClick();
                      }}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      {startLoading ? (
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
                          <span>Start Session</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
            {isOngoing && (
              <button
                onClick={() => {
                  setStartLoading(true);
                  router.push(
                    `${MEETING_BASE_URL}/meeting/officehours/${data.meetingId}/lobby`
                  );
                  // handleJoinClick();
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02]"
              >
                {startLoading ? (
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
                    <span>Join Session</span>
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
