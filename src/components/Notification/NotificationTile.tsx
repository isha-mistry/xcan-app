import React, { useEffect, useState } from "react";
import { NotificationTileProps } from "./NotificationTypeUtils";
import { useRouter } from "next-nprogress-bar";
import { formatTimestampOrDate } from "@/utils/NotificationUtils";
import {
  getBackgroundColor,
  getIcon,
  handleRedirection,
  markAsRead,
} from "./NotificationActions";
import { useNotificationStudioState } from "@/store/notificationStudioState";
import { BiLinkExternal } from "react-icons/bi";
import Link from "next/link";

function NotificationTile({ data, index, length }: NotificationTileProps) {
  const router = useRouter();
  const [readStatus, setReadStatus] = useState<boolean>(data.read_status);
  const [tileData, setTileData] = useState(data);
  const [docId, setDocId] = useState(data?._id);
  const { combinedNotifications } = useNotificationStudioState();

  useEffect(() => {
    setTileData(data);
    setReadStatus(data.read_status);
    setDocId(data?._id);
  }, [data, readStatus, docId]);

  const currentData =
    combinedNotifications.find((n) => n._id === data._id) || data;

  const handleTileRedirection = async () => {
    await handleRedirection(currentData, router, markAsRead);
  };

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tileData.additionalData?.offchainAttestationLink) {
      window.open(tileData.additionalData.offchainAttestationLink, "_blank");
    }
  };

  const renderTitleContent = () => {
    const offchainLink = tileData.additionalData?.offchainAttestationLink;
    if (
      tileData.notification_type === "attestation" &&
      tileData.notification_name === "offchain" &&
      offchainLink
    ) {
      return (
        <>
          <Link
            href={offchainLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <BiLinkExternal
              size={18}
              className="text-black hover:text-blue-600 transition-colors duration-200"
              title="Open link in new tab"
            />
          </Link>
        </>
      );
    }

    return <></>;
  };

  return (
    <>
      <div
        className={`flex flex-col md:flex-row justify-between items-start md:items-center rounded-lg transition-all duration-200 ease-in-out hover:shadow-sm p-3 md:p-5 cursor-pointer hover:scale-[100.3%] mb-[6px]
          shadow-lg space-y-3 md:space-y-0 border border-dark-accent
          text-dark-text-primary ${readStatus ? "bg-dark-secondary" : "bg-dark-tertiary"}`}
        onClick={handleTileRedirection}
      >
        <div className="flex flex-col md:flex-row gap-3 md:gap-5 w-full md:w-auto">
          <div className="flex justify-between">
            <div
              className="flex items-center justify-center rounded-full h-12 w-12 md:h-14 md:w-14 md:min-w-14 shadow-inner transition-colors duration-200 bg-blue-shade-400"
              style={{ backgroundColor: getBackgroundColor(tileData) }}
            >
              {getIcon(tileData)}
            </div>
            <div
              className={`text-xs text-dark-text-secondary font-semibold min-w-24 flex md:hidden items-center justify-end md:justify-center`}
            >
              {formatTimestampOrDate(data.createdAt)}
            </div>
          </div>
          <div className="flex flex-col gap-1 justify-center">
            <h1
              className={`font-semibold text-sm flex gap-2 items-center text-dark-text-primary`}
            >
              {data.notification_title}
              {renderTitleContent()}
            </h1>
            <p className="font-normal text-sm text-dark-text-secondary">
              {data.content.includes("Reason:")
                ? data.content.split("Reason:").map((part, index) =>
                  index === 0 ? (
                    <span key={index}>{part.trim()}</span>
                  ) : (
                    <span key={index}>
                      <br />
                      <strong>Reason:</strong> {part.trim()}
                    </span>
                  )
                )
                : data.content}
            </p>
          </div>
        </div>
        <div
          className={`text-xs text-dark-text-secondary font-semibold min-w-24 hidden md:flex items-center justify-start md:justify-center`}
        >
          {formatTimestampOrDate(data.createdAt)}
        </div>
      </div>
      {/* {index < length - 1 && (
        <hr className="border-[#DDDDDD] border-0.5 mx-2" />
      )} */}
    </>
  );
}

export default NotificationTile;
