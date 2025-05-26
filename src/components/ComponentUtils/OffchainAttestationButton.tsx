import React, { useState, useEffect } from "react";
import { BiLinkExternal } from "react-icons/bi";
import { FaGift, FaCheck } from "react-icons/fa6";
import { Oval } from "react-loader-spinner";
import { Tooltip } from "@nextui-org/react";
import Link from "next/link";
import { getAccessToken } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import toast from "react-hot-toast";
import styles from "./Button.module.css";
import { daoConfigs } from "@/config/daos";
import { useAccount } from "wagmi";
import { useConnection } from "@/app/hooks/useConnection";

interface AttestationButtonProps {
  meetingId: string | undefined;
  daoName: string;
  meetingType: number;
  startTime: number;
  endTime: number;
  uid?: string | null;
  isHost?: boolean;
  attendeeAddress?: string | null;
  onSuccess: (uid: string) => void;
  meetingData?: any;
}

function OffchainAttestationButton({
  meetingId,
  daoName,
  meetingType,
  startTime,
  endTime,
  uid,
  isHost = false,
  attendeeAddress,
  onSuccess,
  meetingData,
}: AttestationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localUid, setLocalUid] = useState<string | null>(uid || null);
  const { address } = useAccount();
  const { isConnected } = useConnection()

  useEffect(() => {
    if (uid) {
      setLocalUid(uid);
    }
  }, [uid]);

  const getAttestationUrl = (daoName: string, uid: string): string => {
    let currentDAO = daoConfigs[daoName.toLowerCase()];
    const baseUrl = currentDAO ? `${currentDAO.attestationUrl}` : "#";

    // const baseUrl =
    //   daoName.toLowerCase() === "optimism"
    //     ? "https://optimism.easscan.org/offchain/attestation/view/"
    //     : daoName.toLowerCase() === "arbitrum"
    //     ? "https://arbitrum.easscan.org/offchain/attestation/view/"
    //     : "#";

    return `${baseUrl}/${uid}`;
  };

  const handleClaimOffchain = async () => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (isLoading || localUid) {
      return;
    }

    try {
      setIsLoading(true);
      const token = await getAccessToken();

      let currentDAO = daoConfigs[daoName.toLowerCase()]

      // const tokenforAttestation =
      //   daoName.toLowerCase() === "optimism" ? "OP" : "ARB";

      const tokenforAttestation = currentDAO.tokenSymbol;

      const requestBody = {
        recipient: isHost ? address : attendeeAddress,
        meetingId: `${meetingId}/${tokenforAttestation}`,
        meetingType,
        startTime,
        endTime,
        daoName,
        meetingData,
      };

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": address,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      };

      const response = await fetchApi("/attest-offchain", requestOptions);
      const data = await response.json();

      if (response.ok) {
        console.log("Attestation successful:", data.offchainAttestation.uid);
        setLocalUid(data.offchainAttestation.uid);
        onSuccess(data.offchainAttestation.uid);
        toast.success("Attestation successful!");
      } else {
        throw new Error(data.message || "Attestation failed");
      }
    } catch (error: any) {
      console.error("Error during attestation:", error);
      toast.error(error.message || "An error occurred during attestation");
    } finally {
      setIsLoading(false);
    }
  };

  const renderClaimedButton = () => (
    <Tooltip content="View Attestation" placement="top" showArrow className="bg-gray-700">
      <Link
        href={getAttestationUrl(daoName, localUid!)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={`${styles.button} ${styles.claimed} w-full py-[3px] text-xs`}
      >
        <span className={styles.buttonText}>Offchain</span>
        <span className={styles.iconWrapper}>
          <BiLinkExternal className={styles.icon} />
        </span>
      </Link>
    </Tooltip>
  );

  const renderClaimButton = () => (
    <Tooltip
      content={
        isLoading
          ? "Claiming Offchain Attestation"
          : "Claim Offchain Attestation"
      }
      className="bg-gray-700"
      placement="top"
      showArrow
    >
      <button
        className={`${styles.button} w-full py-[3px] text-xs`}
        onClick={(e) => {
          e.stopPropagation();
          if (!isLoading && !localUid) {
            handleClaimOffchain();
          }
        }}
        disabled={isLoading || !!localUid}
      >
        <span className={styles.buttonText}>
          {isLoading ? "Claiming..." : "Offchain"}
        </span>
        <span className={styles.iconWrapper}>
          {isLoading ? (
            <Oval
              visible={true}
              height="20"
              width="20"
              color="#fff"
              secondaryColor="#cdccff"
              ariaLabel="oval-loading"
            />
          ) : (
            <FaGift className={styles.icon} />
          )}
        </span>
      </button>
    </Tooltip>
  );

  return localUid ? renderClaimedButton() : renderClaimButton();
}

export default OffchainAttestationButton;
