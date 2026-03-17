import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { PodMember } from '@/models/PodMember';
import { PodProject } from '@/models/PodProject';
import { WeeklyUpdate } from '@/models/WeeklyUpdate';
import { AuditLog } from '@/models/AuditLog';
import { WeeklyUpdateSchema } from '@/schemas/builder-pods';
import {
    getAuthContext,
    hasAnyRole,
    verifyCollegeAccess,
    UnauthorizedError,
    ForbiddenError,
} from '@/lib/rbac';

function getCurrentWeekInfo(): { weekNumber: number; year: number } {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
        ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    return { weekNumber, year: now.getFullYear() };
}

// POST — submit a weekly update for a pod
// Requires pod_lead, college_admin, or super_admin role.
// Members must first submit a project (which grants pod_lead) before
// they can submit weekly updates.
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const ctx = await getAuthContext(req);
        if (!ctx) throw new UnauthorizedError('Not authenticated');

        await dbConnect();
        
        // Ensure old indexes without targetProjectId are removed
        await WeeklyUpdate.syncIndexes();

        const { slug } = await params;
        const parsed = WeeklyUpdateSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || 'Invalid weekly update payload' },
                { status: 400 }
            );
        }
        const { completedThisWeek, blockers, nextMilestone, githubLink, targetProjectId } = parsed.data;

        // Wallet address comes from verified auth context, not body
        const walletAddress = ctx.walletAddress;

        const college = await College.findOne({ slug, deletedAt: null });
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
                status: 'active',
                role: 'pod_lead',
            }).lean();

            if (!member) {
                throw new ForbiddenError('Only an active tech lead can submit weekly updates for this pod');
            }
        }

        const { weekNumber, year } = getCurrentWeekInfo();

        let actualTargetProjectId = targetProjectId || null;
        if (!actualTargetProjectId) {
            const userProject = await PodProject.findOne({
                collegeId: college._id,
                'teamMembers.walletAddress': walletAddress,
                deletedAt: null,
            }).lean();
            if (userProject) {
                actualTargetProjectId = userProject._id.toString();
            }
        }

        const update = await WeeklyUpdate.create({
            collegeId: college._id,
            targetProjectId: actualTargetProjectId,
            weekNumber,
            year,
            submittedBy: walletAddress,
            completedThisWeek,
            blockers: blockers || null,
            nextMilestone,
            githubLink: githubLink || null,
        });

        await AuditLog.create({
            actorWallet: walletAddress,
            action: 'weekly_update.submit',
            entityType: 'WeeklyUpdate',
            entityId: update._id.toString(),
            newValue: { weekNumber, year, collegeSlug: slug },
        });

        return NextResponse.json(
            { success: true, update: { _id: update._id, weekNumber, year } },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: error.message }, { status: 403 });
        console.error('Weekly update submission error:', error);
        if (error.code === 11000) {
            console.error('Mongo 11000 error:', error);
            return NextResponse.json(
                { success: false, error: 'Weekly update already submitted for this week. ' + (error.message || '') },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
