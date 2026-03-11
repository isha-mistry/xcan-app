import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { WeeklyUpdate } from '@/models/WeeklyUpdate';
import { AuditLog } from '@/models/AuditLog';
import { getAuthContext, requireAnyRole, verifyCollegeAccess, UnauthorizedError, ForbiddenError } from '@/lib/rbac';

function getCurrentWeekInfo(): { weekNumber: number; year: number } {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
        ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    return { weekNumber, year: now.getFullYear() };
}

// POST — submit a weekly update for a pod
// Requires: pod_lead, college_admin, or super_admin
// Wallet is taken from verified JWT/session, not request body
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin', 'pod_lead']);

        await dbConnect();
        const { slug } = await params;
        const body = await req.json();
        const { completedThisWeek, blockers, nextMilestone, githubLink } = body;

        // Wallet address comes from verified auth context, not body
        const walletAddress = ctx!.walletAddress;

        if (!completedThisWeek || !nextMilestone) {
            return NextResponse.json(
                { success: false, error: 'completedThisWeek and nextMilestone are required' },
                { status: 400 }
            );
        }

        const college = await College.findOne({ slug, deletedAt: null });
        if (!college) {
            return NextResponse.json(
                { success: false, error: 'College not found' },
                { status: 404 }
            );
        }

        // Verify college-scoped access
        verifyCollegeAccess(ctx!, college._id.toString());

        const { weekNumber, year } = getCurrentWeekInfo();

        const update = await WeeklyUpdate.create({
            collegeId: college._id,
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
            return NextResponse.json(
                { success: false, error: 'Weekly update already submitted for this week' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
