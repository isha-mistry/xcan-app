// attestOffchain.tsx
import { NextResponse, NextRequest } from "next/server";
import {
  SchemaEncoder,
  EAS,
  NO_EXPIRATION,
  ZERO_BYTES32,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { stringToBytes, bytesToHex } from "viem";
import { BASE_URL } from "@/config/constants";
import { daoConfigs } from "@/config/daos";

interface AttestOnchainRequestBody {
  recipient: string;
  meetingId: string;
  meetingType: number;
  startTime: number;
  endTime: number;
  daoName: string;
}

interface MyError {
  message: string;
  code?: number;
}

// const allowedOrigin = "http://localhost:3000";
const allowedOrigin = BASE_URL;

// const url = process.env.NEXT_PUBLIC_ATTESTATION_URL;
// // Set up your ethers provider and signer
// const provider = new ethers.JsonRpcProvider(url, undefined, {
//   staticNetwork: true,
// });
// const privateKey = process.env.PVT_KEY ?? "";
// const signer = new ethers.Wallet(privateKey, provider);
// const eas = new EAS("0x4200000000000000000000000000000000000021");
// eas.connect(signer);

export async function POST(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get("Origin");
  //   if (origin !== allowedOrigin) {
  //     return NextResponse.json(
  //       { success: false, error: "Unauthorized access" },
  //       { status: 403 }
  //     );
  //   }

  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
  const requestData = (await req.json()) as AttestOnchainRequestBody;
  // Your validation logic here

  // const currentDAO=daoConfigs[requestData.daoName];
  const currentDAO = daoConfigs["arbitrum"];

  try {
    const atstUrl = currentDAO.alchemyAttestationUrl;
    // requestData.daoName === "optimism"
    //   ? process.env.NEXT_PUBLIC_OP_ATTESTATION_URL
    //   : requestData.daoName === "arbitrum"
    //   ? process.env.NEXT_PUBLIC_ARB_ATTESTATION_URL
    //   : "";

    // Set up your ethers provider and signer
    const provider = new ethers.JsonRpcProvider(atstUrl, undefined, {
      staticNetwork: true,
    });
    const privateKey = process.env.PVT_KEY ?? "";
    const signer = new ethers.Wallet(privateKey, provider);
    const EASContractAddress = currentDAO ? currentDAO.eascontracAddress : "";
    // requestData.daoName === "optimism"
    //   ? "0x4200000000000000000000000000000000000021"
    //   : requestData.daoName === "arbitrum"
    //   ? "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458"
    //   : "";
    const eas = new EAS(EASContractAddress);
    eas.connect(signer);

    const schemaEncoder = new SchemaEncoder(
      "bytes32 MeetingId,uint8 MeetingType,uint32 StartTime,uint32 EndTime"
    );

    console.log(schemaEncoder);

    const encodedData = schemaEncoder.encodeData([
      {
        name: "MeetingId",
        value: bytesToHex(stringToBytes(requestData.meetingId), { size: 32 }),
        type: "bytes32",
      },
      { name: "MeetingType", value: requestData.meetingType, type: "uint8" },
      { name: "StartTime", value: requestData.startTime, type: "uint32" },
      { name: "EndTime", value: requestData.endTime, type: "uint32" },
    ]);

    console.log(encodedData);

    try {
      eas.connect(signer);
      console.log("connected");

      const delegated = await eas.getDelegated();
      console.log(delegated);
      const schemaUID =
        "0x1e7a1d1627d7ae5d324aa0fd78c5b42474e926dcca73c31365444fd716ff025e";

      console.log("delegated obj: ", delegated);
      const delegatedAttestation = await delegated.signDelegatedAttestation(
        {
          schema: schemaUID,
          recipient: requestData.recipient,
          expirationTime: NO_EXPIRATION,
          revocable: true,
          refUID: ZERO_BYTES32,
          data: encodedData,
          nonce: await eas.getNonce(signer.address),
          value: NO_EXPIRATION,
          deadline: NO_EXPIRATION,
        },
        signer
      );

      console.log("delegatedAttestation: ", delegatedAttestation);
      const verify = await delegated.verifyDelegatedAttestationSignature(
        await signer.getAddress(),
        delegatedAttestation
      );
      console.log("verify obj: ", verify);
      return NextResponse.json({ delegatedAttestation }, { status: 200 });
    } catch (error) {
      console.error("Error generating the attestation object: ", error);

      return NextResponse.json(
        { success: false, error: "Error generating the attestation object" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const err = error as MyError;

    console.error("Error:", err.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
