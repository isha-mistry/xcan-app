import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { PodMember } from '@/models/PodMember';

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        await dbConnect();
        const { slug } = params;

        const college = await College.findOne({ slug, deletedAt: null }, '_id').lean();
        if (!college) {
            return NextResponse.json(
                { success: false, error: 'College not found' },
                { status: 404 }
            );
        }

        const members = await PodMember.find({ collegeId: college._id, deletedAt: null })
            .select('walletAddress name role programmingLevel githubUsername status stylusModulesCompleted contractsDeployed totalScore approvedAt')
            .sort({ role: 1, name: 1 })
            .lean();

        return NextResponse.json({ success: true, members }, { status: 200 });
    } catch (error) {
        console.error('Error fetching pod members:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
