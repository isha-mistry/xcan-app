// import { useRouter } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import React, { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import styles from "./DelegateInfo.module.css";
import { marked } from "marked";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import { BASE_URL } from "@/config/constants";
import { SessionRecords } from "@/types/UserProfileTypes";
import { Link, Cloud } from "lucide-react";
import StatsGrid from "../ComponentUtils/StatesGrid";

function DelegateInfo({
  desc,
  attestationCounts,
}: {
  desc: string;
  attestationCounts: SessionRecords | null;
}) {
  const [loading, setLoading] = useState(true);
  const [isDataLoading, setDataLoading] = useState(true);
  const router = useRouter();
  const [sessionHostCount, setSessionHostCount] = useState(0);
  const [sessionAttendCount, setSessionAttendCount] = useState(0);
  const [officehoursHostCount, setOfficehoursHostCount] = useState(0);
  const [officehoursAttendCount, setOfficehoursAttendCount] = useState(0);
  const [isSessionHostedLoading, setSessionHostedLoading] = useState(true);
  const [isSessionAttendedLoading, setSessionAttendedLoading] = useState(true);
  const [isOfficeHoursHostedLoading, setOfficeHoursHostedLoading] =
    useState(true);
  const [isOfficeHoursAttendedLoading, setOfficeHoursAttendedLoading] =
    useState(true);
  const [activeButton, setActiveButton] = useState("onchain");
  const [convertedDescription, setConvertedDescription] = useState<string>("");
  const { address } = useAccount();
  const { user, ready, getAccessToken, authenticated } = usePrivy();


  useEffect(() => {
    const convertDescription = async () => {
      if (desc) {
        const htmlStatement = await convertMarkdownToHtml(desc);
        setConvertedDescription(htmlStatement);
      }
    }
    convertDescription();
  }, [desc])

  useEffect(() => {
    if (activeButton === "onchain") {
      fetchAttestation("onchain");
    } else if (activeButton === "offchain") {
      fetchAttestation("offchain");
    }
    setLoading(false);
  }, [
    address,
    activeButton,
  ]);

  const fetchAttestation = async (buttonType: string) => {
    setActiveButton(buttonType);
    setSessionHostedLoading(true);
    setSessionAttendedLoading(true);
    setOfficeHoursHostedLoading(true);
    setOfficeHoursAttendedLoading(true);

    try {
      if (attestationCounts) {

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

  const details = [
    {
      number: sessionHostCount,
      desc: "Sessions hosted",
      ref: `/user/${address}?active=delegatesSession&session=hosted`,
    },
    {
      number: sessionAttendCount,
      desc: "Sessions attended",
      ref: `/user/${address}?active=delegatesSession&session=attended`,
    },
    {
      number: officehoursHostCount,
      desc: "Office Hours hosted",
      ref: `/user/${address}?active=officeHours&hours=hosted`,
    },
    {
      number: officehoursAttendCount,
      desc: "Office Hours attended",
      ref: `/user/${address}?active=officeHours&hours=attended`,
    },
  ];

  const renderParagraphs = (text: string) => {
    return text
      .split("\n")
      .filter((paragraph) => paragraph.trim() !== "")
      .map((paragraph, index) => (
        <p key={index} className="mb-3">
          {paragraph}
        </p>
      ));
  };

  const convertMarkdownToHtml = async (markdown: string): Promise<string> => {
    let html = await marked.parse(markdown);

    // Replace <pre> tags with custom styled divs
    html = html.replace(/<pre>([\s\S]*?)<\/pre>/g, (match, content) => {
      return `<div class="${styles.preFormatted}">${content}</div>`;
    });

    return html;
  };

  const isLoading =
    isSessionHostedLoading ||
    isSessionAttendedLoading ||
    isOfficeHoursHostedLoading ||
    isOfficeHoursAttendedLoading;

  return (
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
        blocks={details}
        isLoading={isLoading}
        onBlockClick={(ref: string) => router.push(ref)}
      />

      <div
        style={{ boxShadow: "0px 4px 30.9px 0px rgba(0, 0, 0, 0.12)" }}
        className={`rounded-xl my-7 py-6 px-7 text-sm ${desc ? "" : "min-h-52"
          }`}
      >
        <div className="flex">
          <h1 className={`text-3xl font-semibold mb-3 ${styles.heading}`}>
            About
          </h1>
        </div>
        {loading ? (
          <div className="flex pt-6 justify-center">
            <ThreeDots
              visible={true}
              height="60"
              width="60"
              color="#0500FF"
              ariaLabel="oval-loading"
            />
          </div>
        ) : convertedDescription ? (
          <div
            dangerouslySetInnerHTML={{ __html: convertedDescription }}
            className={`${styles.delegateStatement} rounded-xl py-6 text-sm`}
          />
        ) : (
          <div className="font-semibold text-base flex justify-center items-center mt-7">
            User has not provided a description
          </div>
        )}
      </div>
    </div>
  );
}

export default DelegateInfo;
