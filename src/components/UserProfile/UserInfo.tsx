"use client";

import React, { useState, useEffect } from "react";
import StatsGrid from "../ComponentUtils/StatesGrid";
import dynamic from "next/dynamic";
import styled from "styled-components";
import rehypeSanitize from "rehype-sanitize";
import { useRouter } from "next-nprogress-bar";
import { useAccount } from "wagmi";
import { SessionRecords } from "@/types/UserProfileTypes";
import { Cloud, Link } from "lucide-react";
import { daoConfigs } from "@/config/daos";

interface userInfoProps {
  description: string;
  onSaveButtonClick: (description?: string) => Promise<void>;
  attestationCounts: SessionRecords | null;
  isLoadingStatus?: boolean;
}

const StyledMDEditorWrapper = styled.div`
  .w-md-editor {
    background-color: #12203b !important;
    color: #ffffff !important;
  }

  .w-md-editor-text-pre,
  .w-md-editor-text-input,
  .w-md-editor-text {
    color: #ffffff !important;
  }

  .wmde-markdown {
    background-color: #12203b !important;
    color: #ffffff !important;
  }

  .w-md-editor-toolbar {
    height: auto !important;
    border-radius: 20px 20px 0 0 !important;
    background-color: #242424 !important;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 5px;
  }

  .w-md-editor-toolbar li.active,
  .w-md-editor-toolbar li:hover {
    background-color: #2d2d2d;
  }

  .w-md-editor-toolbar li > button {
    padding: 4px;
  }

  .w-md-editor-toolbar svg {
    width: 18px !important;
    height: 18px !important;
    margin: 0 6px 2px 6px !important;
    color: #ffffff !important;
  }

  .w-md-editor {
    border-radius: 15px !important;
  }
  .w-md-editor-content {
    margin: 12px 0 12px 0 !important;
    font-family: "Poppins", sans-serif !important;
  }
  .wmde-markdown {
    font-family: "Poppins", sans-serif !important;
  }
  .wmde-markdown ul {
    list-style-type: disc !important;
    padding-left: 20px !important;
  }

  .wmde-markdown ol {
    list-style-type: decimal !important;
    padding-left: 20px !important;
  }

  @media (max-width: 768px) {
    .w-md-editor-show-live {
      flex-direction: column;
    }

    .w-md-editor-show-live .w-md-editor-input,
    .w-md-editor-show-live .w-md-editor-preview {
      width: 50% !important;
      flex: 1 1 auto !important;
    }

    .w-md-editor-show-live .w-md-editor-input {
      border-bottom: 1px solid #2d2d2d;
    }
  }
  @media (max-width: 1070px) {
    .w-md-editor-toolbar {
      padding: 2px;
    }

    .w-md-editor-toolbar li > button {
      padding: 2px;
    }

    .w-md-editor-toolbar svg {
      width: 14px !important;
      height: 14px !important;
      margin: 0 2px 1px 2px !important;
    }
  }
`;

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

const UserInfoSkeleton = () => {
  return (
    <div className="pt-4">
      {/* Toggle buttons skeleton */}
      <div className="flex gap-2 0.5xs:gap-4 rounded-xl text-sm flex-wrap mb-4">
        <div className="py-2 px-4 w-24 h-10 bg-gray-200 animate-pulse rounded-full"></div>
        <div className="py-2 px-4 w-24 h-10 bg-gray-200 animate-pulse rounded-full"></div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-md">
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-full mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Description editor skeleton */}
      <div className="mt-7 mx-4 xs:mx-0 sm:mx-4 md:mx-16 lg:mx-0">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="space-y-3">
            <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-full"></div>
            <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded-full"></div>
            <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

function UserInfo({
  description,
  onSaveButtonClick,
  attestationCounts,
  // isLoadingStatus,
}: userInfoProps) {
  const { address } = useAccount();
  const { chain } = useAccount();
  const [isEditing, setEditing] = useState(false);
  const [tempDesc, setTempDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSessionHostedLoading, setSessionHostedLoading] = useState(true);
  const [isSessionAttendedLoading, setSessionAttendedLoading] = useState(true);
  const [isOfficeHoursHostedLoading, setOfficeHoursHostedLoading] = useState(true);
  const [isOfficeHoursAttendedLoading, setOfficeHoursAttendedLoading] = useState(true);
  const [sessionHostCount, setSessionHostCount] = useState(0);
  const [sessionAttendCount, setSessionAttendCount] = useState(0);
  const [officehoursHostCount, setOfficehoursHostCount] = useState(0);
  const [officehoursAttendCount, setOfficehoursAttendCount] = useState(0);
  const [activeButton, setActiveButton] = useState("onchain");
  const [originalDesc, setOriginalDesc] = useState(description);
  const [isMobile, setIsMobile] = useState(false);
  // console.log(isLoadingStatus);
  const router = useRouter();
  const blocks = [
    {
      number: sessionAttendCount,
      desc: "Sessions attended",
      ref: `/profile/${address}}?active=sessions&session=attended`,
    },
    {
      number: officehoursAttendCount,
      desc: "Office Hours attended",
      ref: `/profile/${address}}?active=officeHours&hours=attended`,
    },
  ];

  const isLoading =
    isSessionHostedLoading ||
    isSessionAttendedLoading ||
    isOfficeHoursHostedLoading ||
    isOfficeHoursAttendedLoading;

  const fetchAttestation = async (buttonType: string) => {
    setActiveButton(buttonType);
    setSessionHostedLoading(true);
    setSessionAttendedLoading(true);
    setOfficeHoursHostedLoading(true);
    setOfficeHoursAttendedLoading(true);

    try {
      if (attestationCounts) {
        // const currentDaoRecords =
        //   attestationCounts as keyof SessionRecords;

        if (buttonType === "onchain") {
          setSessionHostCount(
            attestationCounts?.sessionHosted?.onchainCounts || 0
          );
          setSessionAttendCount(
            attestationCounts?.sessionAttended?.onchainCounts || 0
          );
          setOfficehoursHostCount(
            attestationCounts?.officeHoursHosted?.onchainCounts || 0
          );
          setOfficehoursAttendCount(
            attestationCounts?.officeHoursAttended?.onchainCounts || 0
          );
        } else if (buttonType === "offchain") {
          setSessionHostCount(
            attestationCounts?.sessionHosted?.offchainCounts || 0
          );
          setSessionAttendCount(
            attestationCounts?.sessionAttended?.offchainCounts || 0
          );
          setOfficehoursHostCount(
            attestationCounts?.officeHoursHosted?.offchainCounts || 0
          );
          setOfficehoursAttendCount(
            attestationCounts?.officeHoursAttended?.offchainCounts || 0
          );
        }
      }
    } catch (e) {
    } finally {
      setSessionHostedLoading(false);
      setSessionAttendedLoading(false);
      setOfficeHoursHostedLoading(false);
      setOfficeHoursAttendedLoading(false);
    }
  };

  const handleDescChange = (value?: string) => {
    setTempDesc(value || "");
  };

  const handleSaveClick = async () => {
    if (tempDesc !== originalDesc || tempDesc !== "") {
      setLoading(true);
      await onSaveButtonClick(tempDesc);
      setEditing(false);
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setTempDesc(originalDesc);
    setEditing(false);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setOriginalDesc(description);
    setTempDesc(description);
  }, [description]);

  useEffect(() => {
    if (activeButton === "onchain") {
      fetchAttestation("onchain");
    } else if (activeButton === "offchain") {
      fetchAttestation("offchain");
    }
  }, [activeButton, address, address, chain]);

  // if (isDelegate === true || isSelfDelegate === true) {
  //   blocks.unshift(
  //     {
  //       number: sessionHostCount,
  //       desc: "Sessions hosted",
  //       ref: `/profile/${address}}?active=sessions&session=hosted&dao=${daoName}`,
  //     },
  //     {
  //       number: officehoursHostCount,
  //       desc: "Office Hours hosted",
  //       ref: `/profile/${address}}?active=officeHours&hours=attended&dao=${daoName}`,
  //     }
  //   );
  // }

  return (
    <>
      {/* {isLoadingStatus ? (
        <UserInfoSkeleton />
      ) : ( */}
      <div className="pt-4">
        <div className="flex gap-2 0.5xs:gap-4 rounded-xl text-sm flex-wrap">
          <button
            className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${activeButton === "onchain"
              ? "text-blue-shade-100 font-semibold bg-[#f5f5f5]"
              : "text-[#3E3D3D] bg-white"
              } `}
            onClick={() => fetchAttestation("onchain")}
          >
            <Link size={16} className="drop-shadow-lg" />
            Onchain
          </button>
          <button
            className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${activeButton === "offchain"
              ? "text-blue-shade-100 font-semibold bg-[#f5f5f5]"
              : "text-[#3E3D3D] bg-white"
              }`}
            onClick={() => fetchAttestation("offchain")}
          >
            <Cloud size={16} className="drop-shadow-lg" />
            Offchain
          </button>
        </div>
        <StatsGrid
          blocks={blocks}
          isLoading={isLoading}
          onBlockClick={(ref: string) => router.push(ref)}
        />

        {/* {isSelfDelegate ? ( */}
        <div
          style={{ boxShadow: "0px 4px 30.9px 0px rgba(0, 0, 0, 0.12)" }}
          className={`flex flex-col justify-between min-h-48 rounded-xl mt-7 pb-7 mx-4 xs:mx-0 sm:mx-4 md:mx-16 lg:mx-0 py-6`}
        >
          <div className={`${isEditing ? "outline rounded-xl" : ""}`}>
            <StyledMDEditorWrapper className="w-full">
              <MDEditor
                value={isEditing ? tempDesc : description}
                onChange={handleDescChange}
                preview={isMobile ? (isEditing ? "edit" : "preview") : "live"}
                height={isMobile ? 400 : 300}
                hideToolbar={!isEditing}
                visibleDragbar={false}
                previewOptions={{
                  rehypePlugins: [[rehypeSanitize]],
                }}
                textareaProps={{
                  placeholder: "Type your description here...",
                  readOnly: !isEditing,
                }}
                commandsFilter={(cmd) => cmd.name === 'fullscreen' ? false : cmd}
              />
            </StyledMDEditorWrapper>
          </div>

          <div className="flex justify-end mt-3">
            {isEditing ? (
              <>
                <button
                  className="bg-blue-shade-100 text-white text-sm py-1 px-3 rounded-full font-semibold mr-2"
                  onClick={handleCancelClick}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-shade-100 text-white text-sm py-1 px-3 rounded-full font-semibold"
                  onClick={handleSaveClick}
                >
                  {loading ? "Saving" : "Save"}
                </button>
              </>
            ) : (
              <button
                className="bg-blue-shade-100 text-white text-sm py-1 px-4  rounded-full font-semibold"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            )}
          </div>
        </div>
        {/* ) : (
          <></>
        )} */}
      </div>
      {/* )} */}
    </>
  );
}

export default UserInfo;
