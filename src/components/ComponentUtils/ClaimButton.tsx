import React, { useState, useEffect, useRef } from "react";
import { Oval } from "react-loader-spinner";
import { FaCheck, FaGift } from "react-icons/fa6";
import { Tooltip } from "@nextui-org/react";
import styles from "./Button.module.css";
import { ethers } from "ethers";
import { EAS } from "@ethereum-attestation-service/eas-sdk";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { fetchApi } from "@/utils/api";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { daoConfigs } from "@/config/daos";

interface ClaimButtonProps {
  meetingId: string;
  meetingType: number;
  startTime: number;
  endTime: number;
  address: string;
  onChainId: string | undefined;
  disabled: boolean;
  reference_id?:string
  meetingCategory?:string
  attendees?:string,
  onClaimStart: () => void;
  onClaimEnd: () => void;
}

const ClaimButton: React.FC<ClaimButtonProps> = ({
  meetingId,
  meetingType,
  startTime,
  endTime,
  address,
  onChainId,
  disabled,
  reference_id,
  meetingCategory,
  attendees,
  onClaimStart,
  onClaimEnd,
}) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(!!onChainId);
  const { user, ready, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  useEffect(() => {
    setIsClaimed(!!onChainId);
  }, [onChainId]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 9999,
    });
  };

  const handleAttestationOnchain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Early return conditions
    if (isClaimed || isClaiming || disabled) return;
    

    // Reset states
    setIsClaiming(true);
    onClaimStart();

    try {
      // Validate Privy authentication
      if (!ready) {
        toast.error("Privy authentication not ready");
        throw new Error("Privy not ready");
      }

      if (!user) {
        toast.error("Please log in first");
        throw new Error("No user logged in");
      }

      // Get the connected provider
      // const provider = user.wallet?.ethereum;

      const privyProvider = await wallets[0]?.getEthereumProvider();

      if (!privyProvider) {
        toast.error("No wallet connected. Please connect a wallet.");
        throw new Error("No provider found");
      }

      // Use ethers to create a provider
      const ethersProvider = new ethers.BrowserProvider(privyProvider);
      const signer = await ethersProvider.getSigner();

      // Determine DAO-specific details
      let token = "";
      let EASContractAddress = "";

      // switch (dao.toLowerCase()) {
      //   case "optimism":
      //     token = "OP";
      //     EASContractAddress = "0x4200000000000000000000000000000000000021";
      //     break;
      //   case "arbitrum":
      //     token = "ARB";
      //     EASContractAddress = "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458";
      //     break;
      //   default:
      //     throw new Error(`Unsupported DAO: ${dao}`);
      // }

      token="ARB";
      EASContractAddress="0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458";

      // Prepare attestation data
      const data = {
        recipient: address,
        meetingId: `${meetingId}/${token}`,
        meetingType: meetingType,
        startTime: startTime,
        endTime: endTime,
      };

      // Get Privy access token
      const ClientToken = await getAccessToken();

      // Prepare API request headers
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(address && {
          "x-wallet-address": address,
          Authorization: `Bearer ${ClientToken}`,
        }),
      };

      // Fetch attestation details
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(data),
      };

      const res = await fetchApi("/attest-onchain", requestOptions);

      // Handle API response
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `API Error! status: ${res.status}, message: ${errorText}`
        );
      }

      const attestationObject = await res.json();

      // Initialize EAS
      const eas = new EAS(EASContractAddress);
      eas.connect(signer);

      // Prepare attestation parameters
      const schemaUID =
        "0xf9e214a80b66125cad64453abe4cef5263be3a7f01760d0cc72789236fca2b5d";
    
      // Perform on-chain attestation
      const tx = await eas.attestByDelegation({
        schema: schemaUID,
        data: {
          recipient: attestationObject.delegatedAttestation.message.recipient,
          expirationTime:
            attestationObject.delegatedAttestation.message.expirationTime,
          revocable: attestationObject.delegatedAttestation.message.revocable,
          refUID: attestationObject.delegatedAttestation.message.refUID,
          data: attestationObject.delegatedAttestation.message.data,
        },
        signature: attestationObject.delegatedAttestation.signature,
        attester: "0x7B2C5f70d66Ac12A25cE4c851903436545F1b741",
      });

      // Wait for transaction confirmation
      const newAttestationUID = await tx.wait();

      if (newAttestationUID && meetingCategory==="session") {
        // Update attestation UID in backend
        const ClientToken = await getAccessToken();
        const myHeaders: HeadersInit = {
          "Content-Type": "application/json",
          ...(address && {
            "x-wallet-address": address,
            Authorization: `Bearer ${ClientToken}`,
          }),
        };

        const updateResponse = await fetchApi(`/update-attestation-uid`, {
          method: "PUT",
          headers: myHeaders,
          body: JSON.stringify({
            meetingId: meetingId,
            meetingType: meetingType,
            uidOnchain: newAttestationUID,
            address: address
          }),
        });

        const updateData = await updateResponse.json();
        
        if (updateData.success) {
          // Successful claim
          setIsClaimed(true);
          
          // Trigger confetti with a slight delay
          setTimeout(() => {
            triggerConfetti();
          }, 100);

          toast.success("On-chain attestation claimed successfully!");
          onClaimEnd();
        } else {
          throw new Error("Failed to update attestation UID");
        }
      }
      else 
      { 
        if(newAttestationUID && meetingCategory==="officehours")
        {
          // console.log("Line 338:",newAttestationUID);
          const ClientToken = await getAccessToken();
          const myHeaders: HeadersInit = {
            "Content-Type": "application/json",
            ...(address && {
              "x-wallet-address": address,
              Authorization: `Bearer ${ClientToken}`,
            }),
          };
          const updateResponse = await fetchApi(`/edit-office-hours`, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify({
              host_address: address,
              reference_id: reference_id,
              onchain_host_uid: newAttestationUID,
              attendees:attendees,
            }),
          });
  
          const updateData = await updateResponse.json();

          // console.log("Line 353:",updateData);
          
          if (updateData.success) {
            // Successful claim
            setIsClaimed(true);
            
            // Trigger confetti with a slight delay
            setTimeout(() => {
              triggerConfetti();
            }, 100);
  
            toast.success("On-chain attestation claimed successfully!");
            onClaimEnd();
          } else {
            throw new Error("Failed to update attestation UID");
          }
        }
       
      }
    } catch (error: any) {
      // Comprehensive error handling
      console.error("Claim Error:", error);
      
      let errorMessage = "Failed to claim on-chain attestation";
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = "Transaction was rejected by the user";
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = "Insufficient funds for transaction";
      }
      
      toast.error(errorMessage);
      onClaimEnd();
    } finally {
      // Ensure claiming state is reset
      setIsClaiming(false);
    }
  };

  return (
    <>
      <Tooltip
        content={
          isClaiming
            ? "Claiming Onchain Attestation"
            : onChainId || isClaimed
            ? "Received Onchain Attestation"
            : disabled
            ? "Claiming in progress for another session"
            : "Claim Onchain Attestation"
        }
        className="bg-gray-700"
        placement="top"
        showArrow
      >
        <button
          className={`${styles.button} ${
            !!onChainId || isClaimed ? styles.claimed : ""
          } w-full py-[3px] text-xs`}
          onClick={handleAttestationOnchain}
          disabled={!!onChainId || isClaiming || isClaimed || disabled}
        >
          <span className={styles.buttonText}>
            {isClaiming ? "Claiming..." : isClaimed ? "Claimed" : "Claim"}
          </span>
          <span className={styles.iconWrapper}>
            {isClaiming ? (
              <Oval
                visible={true}
                height="20"
                width="20"
                color="#fff"
                secondaryColor="#cdccff"
                ariaLabel="oval-loading"
              />
            ) : isClaimed ? (
              <FaCheck className={styles.icon} />
            ) : (
              <FaGift className={styles.icon} />
            )}
          </span>
        </button>
      </Tooltip>
    </>
  );
};

export default ClaimButton; 
