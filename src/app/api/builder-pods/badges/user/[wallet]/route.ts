import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { UserBadge } from '@/models/UserBadge';

export async function GET(
    req: NextRequest,
    { params }: { params: { wallet: string } }
) {
    try {
        await dbConnect();
        const { wallet } = params;

        if (!wallet || wallet.length < 10) {
            return NextResponse.json(
                { success: false, error: 'Invalid wallet address' },
                { status: 400 }
            );
        }

        const badges = await UserBadge.find({ walletAddress: wallet.toLowerCase() })
            .select('badgeSnapshot collegeId showcaseEventId assignedAt onChainAttested easUid')
            .sort({ assignedAt: -1 })
            .lean();

        return NextResponse.json({ success: true, badges }, {
            status: 200,
            headers: {
                'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
            },
        });
    } catch (error) {
        console.error('Error fetching user badges:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
