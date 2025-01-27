import { NextResponse } from 'next/server';
import { connectDB } from "@/config/connectDB";

export async function GET(request: Request) {
    let client;
    try {
        // Get the ID from the URL search params
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID parameter is required' },
                { status: 400 }
            );
        }

        // Connect to MongoDB
        client = await connectDB();

        // Access the collection
        const db = client.db();
        const collection = db.collection("agora-proposals");
        
        // Query the database using MongoDB
        let proposal = await collection.findOne({ id: id });

        // If proposal not found, fetch from Optimism API
        if (!proposal) {
            try {
                const response = await fetch(`https://vote.optimism.io/api/v1/proposals/${id}`, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                        'mode': 'no-cors',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${process.env.OP_AGORA_AUTH_KEY}`,
                    }
                });

                if (!response.ok) {
                    return NextResponse.json(
                        { error: 'Proposal not found' },
                        { status: 404 }
                    );
                }

                // Parse the response
                const proposalData = await response.json();

                // Save the new proposal to MongoDB
                proposal = {
                    ...proposalData,
                    createdAt: new Date()
                };
                if (proposal) {
                    await collection.insertOne(proposal);
                }
            } catch (apiError) {
                return NextResponse.json(
                    { error: 'Failed to fetch proposal' },
                    { status: 500 }
                );
            }
        }

        // Format the response data
        const formattedData = {
            options: proposal?.proposalResults?.options?.map((opt: { option: string; votes: number }) => ({
                option: opt.option,
                votes: opt.votes
            })) || []
        };
        client.close();

        return NextResponse.json(proposal?.proposalResults, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch proposal data:', error);
        client?.close();

        // Handle invalid ObjectId format
        if (error instanceof Error && error.message.includes('ObjectId')) {
            return NextResponse.json(
                { error: 'Invalid ID format' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch proposal data' },
            { status: 500 }
        );
    }
}