import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { PodProject } from '@/models/PodProject';

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

        const projects = await PodProject.find({ collegeId: college._id, deletedAt: null })
            .select('name problemStatement githubRepo contractAddress demoLink techStack status isApproved statusUpdatedAt createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, projects }, { status: 200 });
    } catch (error) {
        console.error('Error fetching pod projects:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
