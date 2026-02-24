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
              className="text-gray-200 hover:text-blue-600 transition-colors duration-200"
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
        className={`flex flex-col md:flex-row justify-between items-start md:items-center rounded-2xl transition-all duration-300 ease-in-out hover:shadow-2xl p-4 md:p-6 cursor-pointer hover:scale-[1.01] mb-4 border shadow-xl group
          ${readStatus 
            ? "bg-white/[0.02] border-white/5 opacity-70" 
            : "bg-white/[0.05] border-white/10"
          } 
          hover:bg-white/[0.08] hover:border-primary/30`}
        onClick={handleTileRedirection}
      >
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full md:w-auto">
          <div className="flex justify-between items-start">
            <div
              className="flex items-center justify-center rounded-2xl h-14 w-14 md:min-w-14 shadow-inner transition-all duration-300 group-hover:scale-110 bg-primary/20 text-primary border border-primary/20"
              style={{ backgroundColor: getBackgroundColor(tileData) }}
            >
              {getIcon(tileData)}
            </div>
            <div
              className="text-[10px] text-white/30 font-bold uppercase tracking-widest flex md:hidden items-center justify-end bg-white/5 px-2 py-1 rounded-md"
            >
              {formatTimestampOrDate(data.createdAt)}
            </div>
          </div>
          <div className="flex flex-col gap-2 justify-center min-w-0">
            <h1
              className="font-bold text-base flex gap-2 items-center text-white font-robotoMono group-hover:text-primary transition-colors"
            >
              {data.notification_title}
              {renderTitleContent()}
            </h1>
            <p className="font-normal text-sm text-white/50 leading-relaxed line-clamp-2">
              {data.content.includes("Reason:")
                ? data.content.split("Reason:").map((part, index) =>
                  index === 0 ? (
                    <span key={index}>{part.trim()}</span>
                  ) : (
                    <span key={index}>
                      <br />
                      <strong className="text-white/70">Reason:</strong> {part.trim()}
                    </span>
                  )
                )
                : data.content}
            </p>
          </div>
        </div>
        <div
          className="text-[10px] text-white/20 font-bold uppercase tracking-widest hidden md:flex items-center justify-start bg-white/5 px-3 py-1.5 rounded-lg whitespace-nowrap"
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
