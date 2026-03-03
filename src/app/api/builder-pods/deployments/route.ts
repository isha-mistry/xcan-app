import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { Deployment } from '@/models/Deployment';
import { PodMember } from '@/models/PodMember';

// POST — submit a deployment tx hash
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { walletAddress, collegeSlug, projectId, txHash, contractAddress, description } = body;

        if (!walletAddress || !collegeSlug || !txHash) {
            return NextResponse.json(
                { success: false, error: 'walletAddress, collegeSlug, and txHash are required' },
                { status: 400 }
            );
        }

        const college = await College.findOne({ slug: collegeSlug, deletedAt: null });
        if (!college) {
            return NextResponse.json(
                { success: false, error: 'College not found' },
                { status: 404 }
            );
        }

        // Verify membership
        const member = await PodMember.findOne({
            collegeId: college._id,
            walletAddress: walletAddress.toLowerCase(),
            status: { $in: ['active', 'pending'] },
        });
        if (!member) {
            return NextResponse.json(
                { success: false, error: 'Not a member of this college pod' },
                { status: 403 }
            );
        }

        const deployment = await Deployment.create({
            walletAddress: walletAddress.toLowerCase(),
            collegeId: college._id,
            projectId: projectId || null,
            txHash: txHash.toLowerCase(),
            contractAddress: contractAddress?.toLowerCase() || null,
            description: description || null,
        });

        return NextResponse.json(
            { success: true, deployment: { _id: deployment._id, isVerified: false } },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Deployment submission error:', error);
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: 'This transaction hash has already been submitted' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
