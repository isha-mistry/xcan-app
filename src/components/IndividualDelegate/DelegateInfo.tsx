// import { useRouter } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import React, { useEffect, useState } from "react";
import {
  Comment,
  Hourglass,
  Oval,
  RotatingLines,
  ThreeDots,
} from "react-loader-spinner";
import styles from "./DelegateInfo.module.css";
import { marked } from "marked";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import { BASE_URL } from "@/config/constants";
import { MeetingRecords } from "@/types/UserProfileTypes";
import { Link, Cloud } from "lucide-react";
import StatsGrid from "../ComponentUtils/StatesGrid";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

function DelegateInfo({
  props,
  desc,
  attestationCounts,
}: {
  props: Type;
  desc: string;
  attestationCounts: MeetingRecords | null;
}) {
  const [karmaDescription, setKarmaDescription] = useState<string>();
  const [opAgoraDescription, setOpAgoraDescription] = useState<string>();
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
  const [loadingOpAgora, setLoadingOpAgora] = useState(false);
  const [loadingKarma, setLoadingKarma] = useState(false);
  const [convertedDescription, setConvertedDescription] = useState<string>("");
  const { address } = useAccount();
  const { user, ready, getAccessToken, authenticated } = usePrivy();

  useEffect(() => {
    if (activeButton === "onchain") {
      fetchAttestation("onchain");
    } else if (activeButton === "offchain") {
      fetchAttestation("offchain");
    }
  }, [
    address,
    activeButton,
    props.individualDelegate,
    props.daoDelegates,
  ]);

  const fetchAttestation = async (buttonType: string) => {
    setActiveButton(buttonType);
    setSessionHostedLoading(true);
    setSessionAttendedLoading(true);
    setOfficeHoursHostedLoading(true);
    setOfficeHoursAttendedLoading(true);

    const host_uid_key =
      buttonType === "onchain" ? "onchain_host_uid" : "uid_host";

    const attendee_uid_key =
      buttonType === "onchain" ? "onchain_uid_attendee" : "attendee_uid";

    try {
      if (attestationCounts) {
        const currentDaoRecords =
          attestationCounts?.[props.daoDelegates as keyof MeetingRecords];

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

  const details = [
    {
      number: sessionHostCount,
      desc: "Sessions hosted",
      ref: `/${props.daoDelegates}/${props.individualDelegate}?active=delegatesSession&session=hosted&dao=${props.daoDelegates}`,
    },
    {
      number: sessionAttendCount,
      desc: "Sessions attended",
      ref: `/${props.daoDelegates}/${props.individualDelegate}?active=delegatesSession&session=attended&dao=${props.daoDelegates}`,
    },
    {
      number: officehoursHostCount,
      desc: "Office Hours hosted",
      ref: `/${props.daoDelegates}/${props.individualDelegate}?active=officeHours&hours=hosted&dao=${props.daoDelegates}`,
    },
    {
      number: officehoursAttendCount,
      desc: "Office Hours attended",
      ref: `/${props.daoDelegates}/${props.individualDelegate}?active=officeHours&hours=attended&dao=${props.daoDelegates}`,
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

  useEffect(() => {
    const fetchData = async () => {
      if (props.daoDelegates === "arbitrum") {
        try {
          setLoadingKarma(true);
          setLoading(true);
          const res = await fetch(
            `/api/get-arbitrum-delegatelist?user=${props.individualDelegate}`
          );
          const details = await res.json();
          // setKarmaDescription(details.delegate.statement.statement);
          const statementHtml = await convertMarkdownToHtml(
            details.delegate.statement.statement
          );
          setKarmaDescription(details.delegate.statement.statement);
          setConvertedDescription(statementHtml);
          setLoadingKarma(false);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoadingKarma(false);
          setLoading(false);
        }
        setLoading(false);
      } else {
        try {
          setLoading(true);
          setLoadingOpAgora(true);
          const res = await fetch(
            `/api/get-statement?individualDelegate=${props.individualDelegate}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              // body: JSON.stringify({ individualDelegate: props.individualDelegate }),
            }
          );

          if (!res.ok) {
            throw new Error("Failed to fetch data");
          }

          const data = await res.json();
          const statement = data.statement.payload.delegateStatement;
          // setOpAgoraDescription(statement);
          // setConvertedDescription(convertMarkdownToHtml(statement));
          const statementHtml = await convertMarkdownToHtml(statement);
          setOpAgoraDescription(statement);
          setConvertedDescription(statementHtml);
          setLoadingOpAgora(false);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoadingOpAgora(false);
          setLoading(false);
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [props.individualDelegate, props.daoDelegates]);

  const isLoading =
    isSessionHostedLoading ||
    isSessionAttendedLoading ||
    isOfficeHoursHostedLoading ||
    isOfficeHoursAttendedLoading;

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
        blocks={details}
        isLoading={isLoading}
        onBlockClick={(ref: string) => router.push(ref)}
      />

      {/* <div
        style={{ boxShadow: "0px 4px 30.9px 0px rgba(0, 0, 0, 0.12)" }}
        className={`rounded-xl my-7 py-6 px-7 text-sm ${
          desc && loadingKarma && loadingOpAgora ? "" : "min-h-52"
        }`}
      >
        <div className="flex">
          <h1 className={`text-3xl font-semibold mb-3 ${styles.heading}`}>
            Delegate Statement
          </h1>
        </div>
        {loadingOpAgora || loadingKarma || loading ? (
          <div className="flex pt-6 justify-center">
            <ThreeDots
              visible={true}
              height="60"
              width="60"
              color="#0500FF"
              ariaLabel="oval-loading"
            />
          </div>
        ) : desc !== "" && desc !== null ? (
          desc
        ) : convertedDescription ? (
          <div
            dangerouslySetInnerHTML={{ __html: convertedDescription }}
            className={`${styles.delegateStatement} rounded-xl py-6 text-sm`}
          />
        ) : (
          <div className="font-semibold text-base flex justify-center items-center mt-7">
            Delegate has not provided a description
          </div>
        )}
      </div> */}
    </div>
  );
}

export default DelegateInfo;
