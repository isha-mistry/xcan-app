import { connectDB } from "@/config/connectDB";
// import { Item } from "@radix-ui/react-dropdown-menu";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse, NextRequest } from "next/server";

// // Define the request body type
// interface DelegateRequestBody {
//   address: string;
//   image: string;
//   description: string;
//   daoName: string;
//   isDelegate: boolean;
//   displayName: string;
//   emailId: string;
//   socialHandles: {
//     twitter: string;
//     discord: string;
//     discourse: string;
//     github: string;
//   };
// }

type follow_activity = {
  action: string;
  timestamp: Date;
};
type follower_details = {
  address: string;
  isNotification: boolean;
  isFollowing: boolean;
  activity: follow_activity[];
};
type dao_following = {
  isFollowing: boolean;
  isNotification: boolean;
  follower_address: string;
  timestamp: Date;
};
type followings = {
  dao: string;
  following: dao_following[];
};

type network_details = {
  dao_name: string;
  network: string;
  discourse: string;
  description: string;
};

interface DelegateRequestBody {
  address: string;
  image: string;
  // description: string;
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
  followers: follower_details[];
  followings: followings[];
}

// Define the response body type
// interface DelegateResponseBody {
//   success: boolean;
//   data?: {
//     id: string;
//     address: string;
//     image: string;
//     daoName: string;
//     description: string;
//     isDelegate: boolean;
//     displayName: string;
//     emailId: string;
//     socialHandles: {
//       twitter: string;
//       discord: string;
//       discourse: string;
//       github: string;
//     };
//   } | null;
//   error?: string;
// }

interface DelegateResponseBody {
  success: boolean;
  data?: {
    id: string;
    address: string;
    image: string;
    // description: string;
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
    followers: follower_details[];
    followings: followings[];
  } | null;
  error?: string;
}

export async function POST(
  req: NextRequest,
  res: NextApiResponse<DelegateResponseBody>
) {
  const {
    address,
    image,
    isDelegate,
    displayName,
    emailId,
    isEmailVisible,
    socialHandles,
    networks,
  }: DelegateRequestBody = await req.json();

  try {
    // Connect to your MongoDB database
    // console.log("Connecting to MongoDB...");
    const client = await connectDB();
    // console.log("Connected to MongoDB");

    // Access the collection
    const db = client.db();
    const collection = db.collection("delegates");

    // Insert the new delegate document
    // console.log("Inserting delegate document...");
    const result = await collection.insertOne({
      address,
      image,
      isDelegate,
      displayName,
      emailId,
      isEmailVisible,
      socialHandles,
      networks,
    });
    console.log("Delegate document inserted:", result);

    client.close();
    // console.log("MongoDB connection closed");

    if (result.insertedId) {
      // Retrieve the inserted document using the insertedId
      // console.log("Retrieving inserted document...");
      const insertedDocument = await collection.findOne({
        _id: result.insertedId,
      });
      // console.log("Inserted document retrieved");
      return NextResponse.json({ result: insertedDocument }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Failed to retrieve inserted document" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error storing delegate:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  res: NextApiResponse<DelegateResponseBody>
) {
  const {
    address,
    image,
    isDelegate,
    displayName,
    emailId,
    isEmailVisible,
    socialHandles,
    networks,
  }: DelegateRequestBody = await req.json();

  try {
    const client = await connectDB();
    const db = client.db();
    const collection = db.collection("delegates");

    // console.log("Getting wallet address 199:-",address);

    // Convert address to lowercase for consistent matching
    const lowercaseAddress = address.toLowerCase();

    // console.log("Convert into 204 lowercase",lowercaseAddress);

    // Find the existing document
    const existingDocument = await collection.findOne({ 
      address: lowercaseAddress 
    });

    // Prepare update fields
    const updateFields: any = {};
    if (image !== undefined) updateFields.image = image;
    if (isDelegate !== undefined) updateFields.isDelegate = isDelegate;
    if (displayName !== undefined) updateFields.displayName = displayName;
    if (emailId !== undefined) updateFields.emailId = emailId;
    if (isEmailVisible !== undefined) updateFields.isEmailVisible = isEmailVisible;
    if (socialHandles !== undefined) updateFields.socialHandles = socialHandles;

    // Handle networks update
    if (networks && networks.length > 0) {
      // If no existing networks, set the new networks
      if (!existingDocument?.networks || existingDocument.networks.length === 0) {
        updateFields.networks = networks;
      } else {
        // Check if the new network already exists
        const updatedNetworks = [...(existingDocument.networks || [])];
        networks.forEach(newNetwork => {
          const existingNetworkIndex = updatedNetworks.findIndex(
            existingNetwork => existingNetwork.dao_name.toLowerCase() === newNetwork.dao_name.toLowerCase()
          );

          if (existingNetworkIndex !== -1) {
            // Update existing network
            updatedNetworks[existingNetworkIndex] = {
              ...updatedNetworks[existingNetworkIndex],
              ...newNetwork
            };
          } else {
            // Add new network
            updatedNetworks.push(newNetwork);
          }
        });

        updateFields.networks = updatedNetworks;
      }
    }

    // Update the delegate document
    const result = await collection.updateOne(
      { address: address },
      { $set: updateFields }
    );

    client.close();

    if (result.modifiedCount > 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Document updated successfully" 
      }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "No document found to update or no changes made" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating delegate:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}