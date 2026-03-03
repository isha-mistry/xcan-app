import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
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

        const deployments = await Deployment.find({ walletAddress: wallet.toLowerCase() })
            .populate('collegeId', 'name slug')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, deployments }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user deployments:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
