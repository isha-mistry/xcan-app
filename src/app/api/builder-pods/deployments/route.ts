import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { Deployment } from '@/models/Deployment';
import { PodMember } from '@/models/PodMember';
import { getAuthContext, requireAnyRole, UnauthorizedError, ForbiddenError } from '@/lib/rbac';

// POST — submit a deployment tx hash
// Requires: pod_member, pod_lead, college_admin, or super_admin
// Wallet is taken from verified JWT/session, not request body
export async function POST(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin', 'pod_lead', 'pod_member']);

        await dbConnect();
        const body = await req.json();
        const { collegeSlug, projectId, txHash, contractAddress, description } = body;

        // Wallet address comes from verified auth context, not body
        const walletAddress = ctx!.walletAddress;

        if (!collegeSlug || !txHash) {
            return NextResponse.json(
                { success: false, error: 'collegeSlug and txHash are required' },
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
            walletAddress,
            status: { $in: ['active', 'pending'] },
        });
        if (!member) {
            return NextResponse.json(
                { success: false, error: 'Not a member of this college pod' },
                { status: 403 }
            );
        }

        const deployment = await Deployment.create({
            walletAddress,
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
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: error.message }, { status: 403 });
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
