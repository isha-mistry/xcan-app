// attestOffchain.tsx
import { NextResponse, NextRequest } from "next/server";
import {
  SchemaEncoder,
  EAS,
  createOffchainURL,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { stringToBytes, bytesToHex } from "viem";
import axios from "axios";
import { connectDB } from "@/config/connectDB";
import {
  ATTESTATION_ARB_URL,
  SCHEMA_ID,
  SOCKET_BASE_URL,
} from "@/config/constants";
import { io } from "socket.io-client";
// import redis from "@/utils/redis";
import { cacheWrapper } from "@/utils/cacheWrapper";
import { daoConfigs } from "@/config/daos";
import { base } from "viem/chains";

interface AttestOffchainRequestBody {
  recipient: string;
  meetingId: string;
  meetingType: number;
  startTime: number;
  endTime: number;
  daoName: string;
  meetingData?: any;
}

interface MyError {
  message: string;
  code?: number;
}

export async function POST(req: NextRequest, res: NextResponse) {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
  // const requestData = await req.json();
  const requestData = (await req.json()) as AttestOffchainRequestBody;
  // Your validation logic here

  // console.log("Line 47:",requestData);

  const currentDAO = daoConfigs[requestData.daoName];

  try {
    const atstUrl = currentDAO ? currentDAO.alchemyAttestationUrl : "";
    // requestData.daoName === "optimism"
    //   ? ATTESTATION_OP_URL
    //   : requestData.daoName === "arbitrum"
    //   ? ATTESTATION_ARB_URL
    //   : "";

    const provider2 = new ethers.JsonRpcProvider(ATTESTATION_ARB_URL);
    try {
      const network = await provider2.getNetwork();
      console.log("Connected to network:", network);
    } catch (error) {
      console.error("Connection failed:", error);
    }

    // console.log("Line 59:",atstUrl);
    // Set up your ethers provider and signer
    const provider = new ethers.JsonRpcProvider(atstUrl, undefined, {
      staticNetwork: true,
    });
    const privateKey = process.env.PVT_KEY ?? "";
    const signer = new ethers.Wallet(privateKey, provider);

    // console.log("Line 67:",signer);

    const EASContractAddress = currentDAO ? currentDAO.eascontracAddress : "";
    // requestData.daoName === "optimism"
    //   ? "0x4200000000000000000000000000000000000021"
    //   : requestData.daoName === "arbitrum"
    //   ? "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458"
    //   : "";
    const eas = new EAS(EASContractAddress);

    // console.log('Line 77:',EASContractAddress,eas);

    eas.connect(signer);
    // Your initialization code remains the same
    const offchain = await eas.getOffchain();

    // console.log("Line 83:", offchain);

    const schemaEncoder = new SchemaEncoder(
      "bytes32 MeetingId,uint8 MeetingType,uint32 StartTime,uint32 EndTime"
    );

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

    const expirationTime = BigInt(0);
    const currentTime = BigInt(Math.floor(Date.now() / 1000));

    const offchainAttestation = await offchain.signOffchainAttestation(
      {
        schema: SCHEMA_ID,
        recipient: requestData.recipient,
        time: currentTime,
        expirationTime: expirationTime,
        revocable: false,
        refUID:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        data: encodedData,
      },
      signer
    );

    // console.log("Line 119:",offchainAttestation);

    const pkg = {
      sig: offchainAttestation,
      signer: await signer.getAddress(),
    };

    let baseUrl = "";

    baseUrl = currentDAO.offchainAttestationUrl;

    // if (requestData.daoName === "optimism") {
    //   baseUrl = OFFCHAIN_OP_ATTESTATION_BASE_URL;
    // } else if (requestData.daoName) {
    //   baseUrl = OFFCHAIN_ARB_ATTESTATION_BASE_URL;
    // }
    const url = baseUrl + createOffchainURL(pkg);

    // console.log("Line 135:",url);

    const data = {
      filename: `eas.txt`,
      textJson: JSON.stringify(pkg),
    };

    // console.log("Line 151:",data);

    let uploadstatus = false;
    try {
      const response = await axios.post(`${baseUrl}/offchain/store`, data);
      if (response.data) {
        uploadstatus = true;
      }

      // console.log("Line 162:",response.data)

      if (requestData.meetingType === 1) {
        const client = await connectDB();

        const db = client.db();
        const collection = db.collection("sessions");
        await collection.findOneAndUpdate(
          { meetingId: requestData.meetingId.split("/")[0] },
          {
            $set: {
              uid_host: response.data.offchainAttestationId,
            },
          }
        );

        const usersCollection = db.collection("users");
        await usersCollection.findOneAndUpdate(
          { address: requestData.recipient },
          {
            $inc: {
              [`meetingRecords.${requestData.daoName}.sessionHosted.offchainCounts`]: 1,
            },
          }
        );

        if (cacheWrapper.isAvailable) {
          const cacheKey = `profile:${requestData.recipient}`;
          await cacheWrapper.delete(cacheKey);
        }

        client.close();
      } else if (requestData.meetingType === 2) {
        const client = await connectDB();

        const db = client.db();
        const collection = db.collection("sessions");
        await collection.findOneAndUpdate(
          {
            meetingId: requestData.meetingId.split("/")[0],
            "attendees.attendee_address": {
              $regex: new RegExp(`^${requestData.recipient}$`, "i"),
            },
          },
          {
            $set: {
              "attendees.$.attendee_uid": response.data.offchainAttestationId,
            },
          }
        );

        const usersCollection = db.collection("users");
        await usersCollection.findOneAndUpdate(
          { address: requestData.recipient },
          {
            $inc: {
              [`meetingRecords.${requestData.daoName}.sessionAttended.offchainCounts`]: 1,
            },
          }
        );

        if (cacheWrapper.isAvailable) {
          const cacheKey = `profile:${requestData.recipient}`;
          await cacheWrapper.delete(cacheKey);
        }

        client.close();
      } else if (requestData.meetingType === 3) {
        const client = await connectDB();

        const db = client.db();
        const collection = db.collection("office_hours");

        // await collection.findOneAndUpdate(
        //   { meetingId: requestData.meetingId.split("/")[0] },
        //   {
        //     $set: {
        //       uid_host: response.data.offchainAttestationId,
        //     },
        //   }
        // );

        await collection.findOneAndUpdate(
          {
            host_address: requestData.recipient,
            "dao.name": requestData.daoName,
            "dao.meetings.meetingId": requestData.meetingId.split("/")[0],
          },
          {
            $set: {
              "dao.$[dao].meetings.$[meeting].uid_host":
                response.data.offchainAttestationId,
            },
          },
          {
            arrayFilters: [
              { "dao.name": requestData.daoName },
              { "meeting.meetingId": requestData.meetingId.split("/")[0] },
            ],
          }
        );

        const usersCollection = db.collection("users");
        await usersCollection.findOneAndUpdate(
          { address: requestData.recipient },
          {
            $inc: {
              [`meetingRecords.${requestData.daoName}.officeHoursHosted.offchainCounts`]: 1,
            },
          }
        );
        if (cacheWrapper.isAvailable) {
          const cacheKey = `profile:${requestData.recipient}`;
          await cacheWrapper.delete(cacheKey);
        }
        client.close();
      } else if (requestData.meetingType === 4) {
        const client = await connectDB();

        const db = client.db();
        const collection = db.collection("office_hours");

        // await collection.findOneAndUpdate(
        //   {
        //     meetingId: requestData.meetingId.split("/")[0],
        //     "attendees.attendee_address": requestData.recipient,
        //   },
        //   {
        //     $set: {
        //       "attendees.$.attendee_uid": response.data.offchainAttestationId,
        //     },
        //   }
        // );

        await collection.findOneAndUpdate(
          {
            // "host_address": requestData.recipient,
            "dao.name": requestData.daoName,
            "dao.meetings.meetingId": requestData.meetingId.split("/")[0],
            "dao.meetings.attendees.attendee_address": requestData.recipient,
          },
          {
            $set: {
              "dao.$[dao].meetings.$[meeting].attendees.$[attendee].attendee_uid":
                response.data.offchainAttestationId,
            },
          },
          {
            arrayFilters: [
              { "dao.name": requestData.daoName },
              { "meeting.meetingId": requestData.meetingId.split("/")[0] },
              { "attendee.attendee_address": requestData.recipient },
            ],
          }
        );

        const usersCollection = db.collection("users");
        await usersCollection.findOneAndUpdate(
          { address: requestData.recipient },
          {
            $inc: {
              [`meetingRecords.${requestData.daoName}.officeHoursAttended.offchainCounts`]: 1,
            },
          }
        );

        if (cacheWrapper.isAvailable) {
          const cacheKey = `profile:${requestData.recipient}`;
          await cacheWrapper.delete(cacheKey);
        }

        client.close();
      }
    } catch (error) {
      console.error("Error submitting signed attestation: ", error);

      return NextResponse.json(
        { success: true, offchainAttestation, url, uploadstatus },
        { status: 200 }
      );
    }

    // Rest of your code remains the same

    let offchainAttestationLink = "";
    offchainAttestationLink = `${currentDAO.attestationUrl}/${offchainAttestation.uid}`;

    // if (requestData.daoName === "optimism") {
    //   offchainAttestationLink = `https://optimism.easscan.org/offchain/attestation/view/${offchainAttestation.uid}`;
    // } else if (requestData.daoName === "arbitrum") {
    //   offchainAttestationLink = `https://arbitrum.easscan.org/offchain/attestation/view/${offchainAttestation.uid}`;
    // }

    // console.log("Line 258:",offchainAttestationLink);

    let notification_user_role = "";
    if (requestData.meetingType === 1) {
      notification_user_role = "session_hosted";
    } else if (requestData.meetingType === 2) {
      notification_user_role = "session_attended";
    } else if (requestData.meetingType === 3) {
      notification_user_role = "officehour_hosted";
    } else if (requestData.meetingType === 4) {
      notification_user_role = "officehour_attended";
    }
    const notificationToSend = {
      receiver_address: offchainAttestation.message.recipient,
      content: `Congratulations 🎉 ! You just received an Off-chain attestation for attending "${requestData?.meetingData?.title}".`,
      createdAt: Date.now(),
      read_status: false,
      notification_name: "offchain",
      notification_title: "Received Off-chain Attestation",
      notification_type: "attestation",
      additionalData: {
        ...offchainAttestation,
        requestData,
        notification_user_role,
        offchainAttestationLink,
      },
    };

    const client = await connectDB();

    const db = client.db();
    const notificationCollection = db.collection("notifications");

    const notificationResult = await notificationCollection.insertOne(
      notificationToSend
    );

    if (notificationResult.insertedId) {
      const insertedNotification = await notificationCollection.findOne({
        _id: notificationResult.insertedId,
      });
    }

    const dataToSend = {
      ...notificationToSend,
      _id: notificationResult.insertedId,
    };
    const receiver_address = notificationToSend.receiver_address;
    const socket = io(`${SOCKET_BASE_URL}`, {
      withCredentials: true,
    });
    // socket.on("connect", () => {
    //   socket.emit("received_offchain_attestation", {
    //     receiver_address,
    //     dataToSend,
    //   });
    //   socket.disconnect();
    // });

    // socket.on("connect_error", (err) => {
    //   console.error("WebSocket connection error:", err);
    // });

    // socket.on("error", (err) => {
    //   console.error("WebSocket error:", err);
    // });
    await client.close();
    if (cacheWrapper.isAvailable) {
      const cacheKey = `Notification:${requestData.recipient}`;
      await cacheWrapper.delete(cacheKey);
    }

    return NextResponse.json(
      { success: true, offchainAttestation, url, uploadstatus },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as MyError; // Cast error to your custom error interface

    console.error("Error:", err.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
