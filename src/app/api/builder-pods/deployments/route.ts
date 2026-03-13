import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { Deployment } from '@/models/Deployment';
import { PodMember } from '@/models/PodMember';
import {
    getAuthContext,
    hasAnyRole,
    verifyCollegeAccess,
    UnauthorizedError,
    ForbiddenError,
} from '@/lib/rbac';
import { DeploymentSchema } from '@/schemas/builder-pods';

// POST — submit a deployment tx hash
// Requires an authenticated wallet. Admins may submit within their scoped college;
// otherwise the caller must be an active or pending pod member of the selected college.
// Wallet is taken from verified JWT/session, not request body
export async function POST(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        if (!ctx) throw new UnauthorizedError('Not authenticated');

        await dbConnect();
        const parsed = DeploymentSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || 'Invalid deployment payload' },
                { status: 400 }
            );
        }
        const { collegeSlug, projectId, txHash, contractAddress, description } = parsed.data;

        // Wallet address comes from verified auth context, not body
        const walletAddress = ctx.walletAddress;

        const college = await College.findOne({ slug: collegeSlug, deletedAt: null });
        if (!college) {
            return NextResponse.json(
                { success: false, error: 'College not found' },
                { status: 404 }
            );
        }

        const isAdmin = hasAnyRole(ctx, ['super_admin', 'college_admin'], college._id.toString());
        if (isAdmin) {
            verifyCollegeAccess(ctx, college._id.toString());
        } else {
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
