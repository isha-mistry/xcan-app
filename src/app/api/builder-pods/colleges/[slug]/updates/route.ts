import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { WeeklyUpdate } from '@/models/WeeklyUpdate';
import { getAuthContext, hasAnyRole } from '@/lib/rbac';

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

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50);
        const skip = (page - 1) * limit;

        const [updates, total] = await Promise.all([
            WeeklyUpdate.find({ collegeId: college._id, deletedAt: null })
                .select('submittedBy targetProjectId weekNumber year completedThisWeek contractAddresses blockers nextMilestone reviewedBy reviewedAt createdAt')
                .sort({ year: -1, weekNumber: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            WeeklyUpdate.countDocuments({ collegeId: college._id, deletedAt: null }),
        ]);

        const ctx = await getAuthContext(req);
        const isCollegeAdmin = ctx
            ? hasAnyRole(ctx, ['super_admin', 'college_admin'], college._id.toString())
            : false;

        return NextResponse.json(
            {
                success: true,
                updates,
                isCollegeAdmin,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching weekly updates:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
