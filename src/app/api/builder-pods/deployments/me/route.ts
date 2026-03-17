import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Deployment } from '@/models/Deployment';
import { getAuthContext, UnauthorizedError } from '@/lib/rbac';

export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        if (!ctx) throw new UnauthorizedError('Not authenticated');

        await dbConnect();

        const wallet = ctx.walletAddress.toLowerCase();

        const deployments = await Deployment.find({ walletAddress: wallet })
            .populate('collegeId', 'name slug')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, deployments }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }
        console.error('Error fetching user deployments:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
