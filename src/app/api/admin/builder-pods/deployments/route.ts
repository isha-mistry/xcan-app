import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Deployment } from '@/models/Deployment';
import { PodMember } from '@/models/PodMember';
import { College } from '@/models/College';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import {
    getAuthContext, requireAnyRole,
    buildCollegeFilter, verifyCollegeAccess,
    UnauthorizedError, ForbiddenError
} from '@/lib/rbac';

// GET — list pending (unverified) deployments
// super_admin sees all, college_admin/mentor sees only their college's
export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin', 'mentor']);

        await dbConnect();

        const collegeFilter = buildCollegeFilter(ctx!);

        const pending = await Deployment.find({ isVerified: false, ...collegeFilter })
            .populate('collegeId', 'name slug')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, deployments: pending }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('Admin deployments error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH — verify or reject a deployment
// super_admin can verify any, college_admin can verify their own college's
export async function PATCH(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin']);

        await dbConnect();
        const body = await req.json();
        const { deploymentId, action } = body;
        const adminWallet = ctx!.walletAddress;

        if (!deploymentId || !action) {
            return NextResponse.json(
                { success: false, error: 'deploymentId and action are required' },
                { status: 400 }
            );
        }

        const dep = await Deployment.findById(deploymentId);
        if (!dep) {
            return NextResponse.json(
                { success: false, error: 'Deployment not found' },
                { status: 404 }
            );
        }

        // Verify college-scoped access
        verifyCollegeAccess(ctx!, dep.collegeId.toString());

        if (action === 'verify') {
            dep.isVerified = true;
            dep.verifiedBy = adminWallet;
            dep.verifiedAt = new Date();
            await dep.save();

            await PodMember.updateOne(
                { walletAddress: dep.walletAddress, collegeId: dep.collegeId },
                { $inc: { contractsDeployed: 1 } }
            );
            await College.updateOne(
                { _id: dep.collegeId },
                { $inc: { deploymentCount: 1 } }
            );

            await Notification.create({
                walletAddress: dep.walletAddress,
                type: 'deployment_verified',
                title: 'Deployment Verified! ✅',
                body: `Your deployment (${dep.txHash.slice(0, 10)}...) has been verified.`,
                link: '/builder-pods',
            });
        } else if (action === 'reject') {
            await Deployment.findByIdAndDelete(deploymentId);
        } else {
            return NextResponse.json(
                { success: false, error: 'action must be "verify" or "reject"' },
                { status: 400 }
            );
        }

        await AuditLog.create({
            actorWallet: adminWallet,
            action: `deployment.${action}`,
            entityType: 'Deployment',
            entityId: deploymentId,
            newValue: { action },
        });

        return NextResponse.json({ success: true, action }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: error.message }, { status: 403 });
        console.error('Deployment verification error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
