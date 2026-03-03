import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodMember } from '@/models/PodMember';
import { UserBadge } from '@/models/UserBadge';
import { Deployment } from '@/models/Deployment';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const url = new URL(req.url);
        const wallet = url.searchParams.get('wallet');

        if (!wallet) {
            return NextResponse.json(
                { success: false, error: 'wallet query param required' },
                { status: 400 }
            );
        }

        const w = wallet.toLowerCase();

        const [membership, badges, deployments] = await Promise.all([
            PodMember.findOne({ walletAddress: w, deletedAt: null })
                .populate('collegeId', 'name slug podName city state')
                .lean(),

            UserBadge.find({ walletAddress: w })
                .sort({ assignedAt: -1 })
                .lean(),

            Deployment.find({ walletAddress: w, isVerified: true })
                .select('txHash contractAddress description createdAt')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),
        ]);

        return NextResponse.json({
            success: true,
            membership,
            badges,
            recentDeployments: deployments,
            stats: {
                totalBadges: badges.length,
                totalVerifiedDeployments: deployments.length,
                modules: membership?.stylusModulesCompleted ?? 0,
                score: membership?.totalScore ?? 0,
                rank: membership?.individualRank ?? null,
            },
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user pod profile:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
