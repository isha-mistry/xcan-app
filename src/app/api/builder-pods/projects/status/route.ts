import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodProject } from '@/models/PodProject';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import { recalculatePodScore } from '@/lib/builder-pods/leaderboard';
import {
    getAuthContext,
    requireAnyRole,
    verifyCollegeAccess,
    UnauthorizedError,
    ForbiddenError,
} from '@/lib/rbac';
import { ProjectStatusUpdateSchema } from '@/schemas/builder-pods';

// PATCH /api/builder-pods/projects/status — update project status or approve
export async function PATCH(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin']);

        await dbConnect();
        const parsed = ProjectStatusUpdateSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || 'Invalid project update payload' },
                { status: 400 }
            );
        }
        const { projectId, status, isApproved } = parsed.data;
        const adminWallet = ctx!.walletAddress;

        const project = await PodProject.findById(projectId);
        if (!project || project.deletedAt) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            );
        }

        verifyCollegeAccess(ctx!, project.collegeId.toString());

        const oldValues: Record<string, any> = {};
        const newValues: Record<string, any> = {};

        if (status) {
            oldValues.status = project.status;
            project.status = status;
            project.statusUpdatedBy = adminWallet;
            project.statusUpdatedAt = new Date();
            newValues.status = status;
        }

        if (typeof isApproved === 'boolean') {
            oldValues.isApproved = project.isApproved;
            project.isApproved = isApproved;
            if (isApproved) {
                project.approvedBy = adminWallet;
                project.approvedAt = new Date();
            } else {
                project.approvedBy = null;
                project.approvedAt = null;
            }
            newValues.isApproved = isApproved;
        }

        if (Object.keys(newValues).length === 0) {
            return NextResponse.json(
                { success: true, project: { _id: project._id, status: project.status, isApproved: project.isApproved }, noChanges: true },
                { status: 200 }
            );
        }

        await project.save();

        // Notify project creator
        await Notification.create({
            walletAddress: project.createdBy,
            type: 'project_status_changed',
            title: `Project Updated: ${project.name}`,
            body: status
                ? `Status changed to ${status.replace(/_/g, ' ')}`
                : isApproved
                    ? 'Project approved'
                    : 'Project approval removed',
            link: '/builder-pods',
        });

        await AuditLog.create({
            actorWallet: adminWallet,
            action: status ? 'project.status_update' : 'project.approve',
            entityType: 'PodProject',
            entityId: projectId,
            oldValue: oldValues,
            newValue: newValues,
        });

        // Inline leaderboard update for pod score
        await recalculatePodScore(project.collegeId);

        return NextResponse.json(
            { success: true, project: { _id: project._id, status: project.status, isApproved: project.isApproved } },
            { status: 200 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ success: false, error: error.message }, { status: 403 });
        }
        console.error('Project status update error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
