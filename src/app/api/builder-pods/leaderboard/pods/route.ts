import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { LeaderboardScore } from '@/models/LeaderboardScore';

export async function GET() {
    try {
        await dbConnect();

        const pods = await LeaderboardScore.find()
            .populate('collegeId', 'name slug city state podName status')
            .sort({ totalScore: -1 })
            .lean();

        return NextResponse.json({ success: true, pods }, { status: 200 });
    } catch (error) {
        console.error('Error fetching pod leaderboard:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
