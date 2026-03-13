import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { recalculatePodLeaderboard, recalculateIndividualScores } from '@/lib/builder-pods/leaderboard';
import { ForbiddenError, getAuthContext, requireRole, UnauthorizedError } from '@/lib/rbac';

// POST /api/builder-pods/leaderboard/recalculate
// Trigger full leaderboard recalculation (super_admin or cron)
export async function POST(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireRole(ctx, 'super_admin');

        await dbConnect();

        await recalculatePodLeaderboard();
        await recalculateIndividualScores();

        return NextResponse.json(
            { success: true, message: 'Leaderboard recalculated' },
            { status: 200 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }
        console.error('Leaderboard recalculation error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
