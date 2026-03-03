import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { recalculatePodLeaderboard, recalculateIndividualScores } from '@/lib/builder-pods/leaderboard';

// POST /api/builder-pods/leaderboard/recalculate
// Trigger full leaderboard recalculation (super_admin or cron)
export async function POST() {
    try {
        await dbConnect();

        await recalculatePodLeaderboard();
        await recalculateIndividualScores();

        return NextResponse.json(
            { success: true, message: 'Leaderboard recalculated' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Leaderboard recalculation error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
