import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import { cacheWrapper } from "@/utils/cacheWrapper";


type network_details = {
  dao_name: string;
  network: string;
  discourse: string;
  description: string;
};

interface DelegateRequestBody {
  address: string;
  image: string;
  isDelegate: boolean;
  displayName: string;
  emailId: string;
  isEmailVisible: boolean;
  socialHandles: {
    twitter: string;
    discord: string;
    github: string;
  };
  networks: network_details[];
}

interface DelegateResponseBody {
  success: boolean;
  data?: {
    id: string;
    address: string;
    image: string;
    isDelegate: boolean;
    displayName: string;
    emailId: string;
    isEmailVisible: boolean;
    createdAt: Date;
    socialHandles: {
      twitter: string;
      discord: string;
      github: string;
    };
    networks: network_details[];
  } | null;
  error?: string;
}

export async function GET(
  req: Request,
  res: NextResponse<DelegateResponseBody>
) {
  try {
    const client = await connectDB();
    // console.log("Get API called!");
    const db = client.db();
    const collection = db.collection("delegates");
    const address = req.url.split("profile/")[1];

    const documents = await collection
      .find({
        address: { $regex: `^${address}$`, $options: "i" },
      })
      .toArray();

    const processedDocuments = documents.map((doc) => {
      if (!doc.isEmailVisible) {
        const { emailId, ...restofDoc } = doc;
        return restofDoc;
      } else {
        return doc;
      }
    });

    client.close();

    return NextResponse.json(
      { success: true, data: processedDocuments },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving data in profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  res: NextResponse<DelegateResponseBody>
) {
  const { address }: DelegateRequestBody = await req.json();

  try {
    // Connect to MongoDB
    const address = req.url.split("profile/")[1];
    const cacheKey = `profile:${address}`;

    // Try to get from cache first
    if (cacheWrapper.isAvailable) {
      const cacheValue = await cacheWrapper.get(cacheKey);
      if (cacheValue) {
        console.log("Serving from cache profile!");
        return NextResponse.json(
          { success: true, data: JSON.parse(cacheValue) },
          { status: 200 }
        );
      }
    }

    const client = await connectDB();

    // Access the collection
    const db = client.db();
    const collection = db.collection("delegates");

    // Find documents based on address
    const documents = await collection
      .find({
        address: { $regex: `^${address}$`, $options: "i" },
      })
      .toArray();


    // Try to cache the result if Redis is available
    if (cacheWrapper.isAvailable) {
      await cacheWrapper.set(cacheKey, JSON.stringify(documents), 3600);
    }

    client.close();

    // Return the found documents
    return NextResponse.json(
      { success: true, data: documents },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving data in profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
