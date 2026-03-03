import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { recalculatePodLeaderboard, recalculateIndividualScores } from '@/lib/builder-pods/leaderboard';

// Cron job: runs every hour (0 * * * *)
// Recalculates pod and individual leaderboard scores
export async function GET() {
    try {
        await dbConnect();
        await recalculatePodLeaderboard();
        await recalculateIndividualScores();
        return NextResponse.json({ success: true, message: 'Leaderboard recalculated' });
    } catch (error) {
        console.error('Cron leaderboard error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
