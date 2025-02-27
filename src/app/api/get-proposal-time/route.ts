import { connectDB } from "@/config/connectDB";

export async function GET(request: any) {
    let client;
    try {
        client = await connectDB();
        const db = client.db();

        const { searchParams } = new URL(request.url);

        const dao = searchParams.get("dao");
        const page = parseInt(searchParams.get("page") || "1", 10); // Default to page 1
        const limit = 7; // Number of proposals per page
        const skip = (page - 1) * limit; // Calculate the number of documents to skip

        if (!dao) {
            return new Response(
                JSON.stringify({ error: "DAO parameter is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        let collectionName;
        if (dao.toLowerCase().includes("arbitrum")) {
            collectionName = "tally-proposals";
        } else {
            await client.close();
            return new Response(
                JSON.stringify({ error: "Invalid DAO chain specified" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const collection = db.collection(collectionName);

        // Get total count for pagination
        const totalProposals = await collection.countDocuments();

        // Fetch paginated proposals
        const proposals = await collection
            .find({})
            .sort({ createdAt: -1 })
            .skip(skip) // Apply pagination
            .limit(limit)
            .toArray();

        // Format proposals
        const formattedProposals = proposals.map((proposal) => {

            return {
                startTime: proposal.start?.timestamp,
                endTime: proposal.end?.timestamp,
                status: proposal.status,
                createdTransactionHash: proposal.metadata?.txHash,
            };

        });

        await client.close();

        return new Response(
            JSON.stringify({
                dao: dao,
                proposals: formattedProposals,
                totalProposals, // Include total count for pagination
                currentPage: page, // Return current page
                totalPages: Math.ceil(totalProposals / limit), // Calculate total pages
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("API Error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
