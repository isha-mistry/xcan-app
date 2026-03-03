import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const url = new URL(req.url);
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);

        const individuals = await PodMember.find({
            status: 'active',
            deletedAt: null,
        })
            .populate('collegeId', 'name slug podName')
            .select('walletAddress name role totalScore individualRank stylusModulesCompleted contractsDeployed weeklyActivityScore projectContributionScore collegeId')
            .sort({ totalScore: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ success: true, individuals }, { status: 200 });
    } catch (error) {
        console.error('Error fetching individual leaderboard:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
