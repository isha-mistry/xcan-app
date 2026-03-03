import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Deployment } from '@/models/Deployment';
import { PodMember } from '@/models/PodMember';
import { College } from '@/models/College';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';

// GET — list pending (unverified) deployments
export async function GET() {
    try {
        await dbConnect();

        const pending = await Deployment.find({ isVerified: false })
            .populate('collegeId', 'name slug')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, deployments: pending }, { status: 200 });
    } catch (error) {
        console.error('Admin deployments error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// PATCH — verify or reject a deployment
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { deploymentId, action, adminWallet } = body;

        if (!deploymentId || !action || !adminWallet) {
            return NextResponse.json(
                { success: false, error: 'deploymentId, action, and adminWallet are required' },
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

        if (action === 'verify') {
            dep.isVerified = true;
            dep.verifiedBy = adminWallet.toLowerCase();
            dep.verifiedAt = new Date();
            await dep.save();

            // Increment member + college counters
            await PodMember.updateOne(
                { walletAddress: dep.walletAddress, collegeId: dep.collegeId },
                { $inc: { contractsDeployed: 1 } }
            );
            await College.updateOne(
                { _id: dep.collegeId },
                { $inc: { deploymentCount: 1 } }
            );

            // Notify member
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
            actorWallet: adminWallet.toLowerCase(),
            action: `deployment.${action}`,
            entityType: 'Deployment',
            entityId: deploymentId,
            newValue: { action },
        });

        return NextResponse.json({ success: true, action }, { status: 200 });
    } catch (error) {
        console.error('Deployment verification error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
