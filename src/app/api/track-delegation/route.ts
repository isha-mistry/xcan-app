import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import { Collection } from "mongodb";

interface DelegateSchema {
  address: string;
  delegation: Delegation;
}

interface Delegation {
  optimism?: DelegationDetails[];
  arbitrum?: DelegationDetails[];
}

interface DelegationDetails {
  delegator: string;
  to_delegator: string;
  from_delegate: string;
  token: string;
  page: string;
  timestamp: Date;
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const client = await connectDB();
    const db = client.db();
    const collectionName = "track_delegation";

    const collections = await db
      .listCollections({ name: collectionName })
      .toArray();

    if (collections.length === 0) {
      await db.createCollection(collectionName);
      console.log(`${collectionName} collection created.`);
    }

    const collection: Collection<DelegateSchema> =
      db.collection(collectionName);

    // Parse and validate request body
    const body = await req.json();
    const { address, delegation } = body as DelegateSchema;


    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found!" },
        { status: 404 }
      );
    }

    // Validate delegation data structure
    if (delegation && typeof delegation === "object") {
      for (const network of ["optimism", "arbitrum"] as const) {
        if (delegation[network]) {
          if (!Array.isArray(delegation[network])) {
            return NextResponse.json(
              {
                success: false,
                message: `Invalid ${network} delegation format`,
              },
              { status: 400 }
            );
          }

          // Validate each delegation detail
          for (const detail of delegation[network]!) {
            if (!validateDelegationDetails(detail)) {
              return NextResponse.json(
                {
                  success: false,
                  message: `Invalid delegation details format for ${network}`,
                },
                { status: 400 }
              );
            }
          }
        }
      }
    }

    const existingDocument = await collection.findOne({ address });

    if (existingDocument) {
      const updateData: { $push?: Record<string, any> } = {};

      // Merge delegation if provided
      if (delegation) {
        for (const [network, details] of Object.entries(delegation)) {
          if (details && Array.isArray(details)) {
            if (!updateData.$push) updateData.$push = {};
            updateData.$push[`delegation.${network}`] = {
              $each: details.map((detail) => ({
                ...detail,
                timestamp: detail.timestamp
              })),
            };
          }
        }
      }

      if (Object.keys(updateData).length > 0) {
        await collection.updateOne({ address }, updateData);
      }

      return NextResponse.json(
        { success: true, message: "Document updated successfully!" },
        { status: 200 }
      );
    } else {
      // Create a new document
      const newDelegation: DelegateSchema = {
        address,
        delegation: delegation || {},
      };

      // Add timestamp to the document
      const documentToInsert = {
        ...newDelegation, 
      };

      await collection.insertOne(documentToInsert);

      return NextResponse.json(
        { success: true, message: "New document created!" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to validate delegation details
function validateDelegationDetails(detail: any): detail is DelegationDetails {
  return (
    typeof detail === "object" &&
    typeof detail.delegator === "string" &&
    typeof detail.to_delegator === "string" &&
    typeof detail.from_delegate === "string" &&
    typeof detail.token === "string" &&
    typeof detail.page==="string" &&
    detail.timestamp !== undefined
  );
}
