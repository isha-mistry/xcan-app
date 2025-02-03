import { connectDB } from "@/config/connectDB";
import { Meeting } from "@/types/OfficeHoursTypes";
import { VideoReport } from "@/types/ReportVideoTypes";
import { NextResponse, NextRequest } from "next/server";

// Define the request body type
export interface ReportRequestBody {
  meetingId: string;
  host_address: string;
  video_reports: VideoReport;
  collection: string;
}

export async function POST(req: NextRequest, res: NextResponse) {
  const {
    meetingId,
    host_address,
    video_reports,
    collection,
  }: ReportRequestBody = await req.json();

  if (
    !meetingId ||
    !host_address ||
    !video_reports ||
    !video_reports.reports ||
    !collection
  ) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    const client = await connectDB();
    const db = client.db();
    const collectionRef = db.collection(collection);

    let existingDocument;
    let query;

    if (collection === "meetings") {
      query = { meetingId, host_address };
      existingDocument = await collectionRef.findOne(query);
    } else if (collection === "office_hours") {
      query = { host_address };
      existingDocument = await collectionRef.findOne(query);

      // Check if the meetingId exists in any of the dao's meetings
      const meetingExists = existingDocument?.dao?.some((dao: any) =>
        dao.meetings.some((meeting: Meeting) => meeting.meetingId === meetingId)
      );

      if (!meetingExists) {
        client.close();
        return NextResponse.json(
          { error: "Meeting not found in office hours" },
          { status: 404 }
        );
      }
    } else {
      client.close();
      return NextResponse.json(
        { error: "Invalid collection specified" },
        { status: 400 }
      );
    }

    if (!existingDocument) {
      client.close();
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const userWalletAddresses = video_reports.reports.map(
      (report) => report.user_wallet_address
    );

    if (collection === "meetings") {
      const existingReports = existingDocument.video_reports?.reports || [];
      const userAlreadyReported = existingReports.some(
        (report: { user_wallet_address: string }) =>
          userWalletAddresses.includes(report.user_wallet_address)
      );

      if (userAlreadyReported) {
        client.close();
        return NextResponse.json(
          { exists: true, error: "User already reported the session before" },
          { status: 200 }
        );
      }

      if (existingDocument.video_reports) {
        await collectionRef.updateOne(query, {
          /* @ts-ignore */
          $push: {
            "video_reports.reports": { $each: video_reports.reports },
          },
        });
      } else {
        await collectionRef.updateOne(query, { $set: { video_reports } });
      }
    } else if (collection === "office_hours") {
      // Find the specific meeting in the nested structure
      const daoIndex = existingDocument.dao.findIndex((dao: any) =>
        dao.meetings.some((meeting: Meeting) => meeting.meetingId === meetingId)
      );

      const meetingIndex = existingDocument.dao[daoIndex].meetings.findIndex(
        (meeting: Meeting) => meeting.meetingId === meetingId
      );

      const existingReports =
        existingDocument.dao[daoIndex].meetings[meetingIndex].video_reports
          ?.reports || [];

      const userAlreadyReported = existingReports.some(
        (report: { user_wallet_address: string }) =>
          userWalletAddresses.includes(report.user_wallet_address)
      );

      if (userAlreadyReported) {
        client.close();
        return NextResponse.json(
          { exists: true, error: "User already reported the session before" },
          { status: 200 }
        );
      }

      const updatePath = `dao.${daoIndex}.meetings.${meetingIndex}.video_reports`;

      if (existingDocument.dao[daoIndex].meetings[meetingIndex].video_reports) {
        await collectionRef.updateOne(query, {
          /* @ts-ignore */
          $push: {
            [`${updatePath}.reports`]: { $each: video_reports.reports },
          },
        });
      } else {
        await collectionRef.updateOne(query, {
          $set: { [updatePath]: video_reports },
        });
      }
    }

    client.close();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error storing meeting:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
