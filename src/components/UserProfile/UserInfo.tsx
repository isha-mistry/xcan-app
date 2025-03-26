"use client";

import React, { useState, useEffect } from "react";
import StatsGrid from "../ComponentUtils/StatesGrid";
import dynamic from "next/dynamic";
import styled from "styled-components";
import rehypeSanitize from "rehype-sanitize";
import { useRouter } from "next-nprogress-bar";
import { useAccount } from "wagmi";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { MeetingRecords } from "@/types/UserProfileTypes";
import { Cloud, Link } from "lucide-react";
import { daoConfigs } from "@/config/daos";

interface userInfoProps {
  karmaDesc: string;
  description: string;
  isDelegate: boolean;
  isSelfDelegate: boolean;
  onSaveButtonClick: (description?: string) => Promise<void>;
  daoName: string;
  attestationCounts: MeetingRecords | null;
}

const StyledMDEditorWrapper = styled.div`
  .w-md-editor {
    background-color: white !important;
    color: black !important;
  }

  .w-md-editor-text-pre,
  .w-md-editor-text-input,
  .w-md-editor-text {
    color: black !important;
  }

  .wmde-markdown {
    background-color: white !important;
    color: black !important;
  }

  .w-md-editor-toolbar {
    height: auto !important;
    border-radius: 20px 20px 0 0 !important;
    background-color: white !important;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 5px;
  }

  .w-md-editor-toolbar li.active,
  .w-md-editor-toolbar li:hover {
    background-color: #e6e6e6;
  }

  .w-md-editor-toolbar li > button {
    padding: 4px;
  }

  .w-md-editor-toolbar svg {
    width: 18px !important;
    height: 18px !important;
    margin: 0 6px 2px 6px !important;
    color: black !important;
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
      border-bottom: 1px solid #ddd;
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

function UserInfo({
  karmaDesc,
  description,
  isDelegate,
  isSelfDelegate,
  onSaveButtonClick,
  attestationCounts,
}: userInfoProps) {
  const { address } = useAccount();
  const { chain } = useAccount();
  const { walletAddress } = useWalletAddress();
  const [isEditing, setEditing] = useState(false);
  const [tempDesc, setTempDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSessionHostedLoading, setSessionHostedLoading] = useState(true);
  const [isSessionAttendedLoading, setSessionAttendedLoading] = useState(true);
  const [isOfficeHoursHostedLoading, setOfficeHoursHostedLoading]=useState(true);
  const [isOfficeHoursAttendedLoading, setOfficeHoursAttendedLoading]=useState(true);
  const [sessionHostCount, setSessionHostCount] = useState(0);
  const [sessionAttendCount, setSessionAttendCount] = useState(0);
  const [officehoursHostCount, setOfficehoursHostCount] = useState(0);
  const [officehoursAttendCount, setOfficehoursAttendCount] = useState(0);
  const [activeButton, setActiveButton] = useState("onchain");
  const [originalDesc, setOriginalDesc] = useState(description || karmaDesc);
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();
  const blocks = [
    {
      number: sessionAttendCount,
      desc: "Sessions attended",
      ref: `/profile/${walletAddress}}?active=sessions&session=attended`,
    },
    {
      number: officehoursAttendCount,
      desc: "Office Hours attended",
      ref: `/profile/${walletAddress}}?active=officeHours&hours=attended`,
    },
  ];
  const getDaoNameByChain = (chainName: string): string | undefined => {
    for (const key in daoConfigs) {
      if (daoConfigs[key].chainName === chainName) {
        return daoConfigs[key].name.toLowerCase();
      }
    }
    return ""; // Return undefined if no match is found
  };
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
    const dao_name = getDaoNameByChain(chain?.name as string);
    try {
      if (attestationCounts) {
        const currentDaoRecords =
          attestationCounts?.[dao_name as keyof MeetingRecords];

        if (buttonType === "onchain") {
          setSessionHostCount(
            currentDaoRecords?.sessionHosted?.onchainCounts || 0
          );
          setSessionAttendCount(
            currentDaoRecords?.sessionAttended?.onchainCounts || 0
          );
          setOfficehoursHostCount(
            currentDaoRecords?.officeHoursHosted?.onchainCounts || 0
          );
          setOfficehoursAttendCount(
            currentDaoRecords?.officeHoursAttended?.onchainCounts || 0
          );
        } else if (buttonType === "offchain") {
          setSessionHostCount(
            currentDaoRecords?.sessionHosted?.offchainCounts || 0
          );
          setSessionAttendCount(
            currentDaoRecords?.sessionAttended?.offchainCounts || 0
          );
          setOfficehoursHostCount(
            currentDaoRecords?.officeHoursHosted?.offchainCounts || 0
          );
          setOfficehoursAttendCount(
            currentDaoRecords?.officeHoursAttended?.offchainCounts || 0
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
    setLoading(true);
    await onSaveButtonClick(tempDesc);
    setEditing(false);
    setLoading(false);
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
    setOriginalDesc(description || karmaDesc);
    setTempDesc(description || karmaDesc);
  }, [description, karmaDesc]);

  useEffect(() => {
    if (activeButton === "onchain") {
      fetchAttestation("onchain");
    } else if (activeButton === "offchain") {
      fetchAttestation("offchain");
    }
  }, [activeButton, walletAddress, address, chain]);

  if (isDelegate === true || isSelfDelegate === true) {
    blocks.unshift(
      {
        number: sessionHostCount,
        desc: "Sessions hosted",
        ref: `/profile/${walletAddress}}?active=sessions&session=hosted`,
      },
      {
        number: officehoursHostCount,
        desc: "Office Hours hosted",
        ref: `/profile/${walletAddress}}?active=officeHours&hours=attended`,
      }
    );
  }
  return (
    <div className="pt-4">
      <div className="flex gap-2 0.5xs:gap-4 rounded-xl text-sm flex-wrap">
        <button
          className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
            activeButton === "onchain"
              ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
              : "text-[#3E3D3D] bg-white"
          } `}
          onClick={() => fetchAttestation("onchain")}
        >
          <Link size={16} className="drop-shadow-lg" />
          Onchain
        </button>
        <button
          className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
            activeButton === "offchain"
              ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
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

      {isSelfDelegate ? (
        <div
          style={{ boxShadow: "0px 4px 30.9px 0px rgba(0, 0, 0, 0.12)" }}
          className={`flex flex-col justify-between min-h-48 rounded-xl my-7 mx-4 xs:mx-0 sm:mx-4 md:mx-16 lg:mx-0 p-6
        ${isEditing ? "outline" : ""}`}
        >
          <StyledMDEditorWrapper className="w-full">
            <MDEditor
              value={isEditing ? tempDesc : description || karmaDesc}
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
              }}
            />
          </StyledMDEditorWrapper>

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
      ) : (
        <></>
      )}
    </div>
  );
}

export default UserInfo;
