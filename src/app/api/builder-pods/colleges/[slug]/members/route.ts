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

        const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1', 10));
        const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') || '50', 10)));

        const college = await College.findOne({ slug, deletedAt: null }, '_id').lean();
        if (!college) {
            return NextResponse.json(
                { success: false, error: 'College not found' },
                { status: 404 }
            );
        }

        const memberFilter = { collegeId: college._id, deletedAt: null };

        const [members, totalCount] = await Promise.all([
            PodMember.find(memberFilter)
                .select('walletAddress name role programmingLevel githubUsername status stylusModulesCompleted contractsDeployed totalScore approvedAt')
                .sort({ role: 1, name: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            PodMember.countDocuments(memberFilter),
        ]);

        const pagination = {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
        };

        return NextResponse.json({ success: true, members, pagination }, { status: 200 });
    } catch (error) {
        console.error('Error fetching pod members:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
