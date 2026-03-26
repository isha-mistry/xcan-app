import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { PodMember } from '@/models/PodMember';
import { PodProject } from '@/models/PodProject';
import { WeeklyUpdate } from '@/models/WeeklyUpdate';

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        await dbConnect();
        const { slug } = params;

        const college = await College.findOne({ slug, deletedAt: null }).lean();
        if (!college) {
            return NextResponse.json(
                { success: false, error: 'College not found' },
                { status: 404 }
            );
        }

        const [members, projects, recentUpdates] = await Promise.all([
            PodMember.find({ collegeId: college._id, deletedAt: null })
                .select('walletAddress name role requestedRole programmingLevel githubUsername status stylusModulesCompleted contractsDeployed totalScore')
                .sort({ role: 1, name: 1 })
                .lean(),

            PodProject.find({ collegeId: college._id, deletedAt: null })
                .select('name problemStatement githubRepo contractAddress demoLink techStack status isApproved teamCode teamLeader teamMembers createdBy createdAt submittedToShowcase')
                .sort({ createdAt: -1 })
                .lean(),

            WeeklyUpdate.find({ collegeId: college._id, deletedAt: null })
                .select('submittedBy targetProjectId weekNumber year completedThisWeek blockers nextMilestone githubLink createdAt')
                .sort({ year: -1, weekNumber: -1 })
                .limit(10)
                .lean(),
        ]);

        const memberCount = members.length;
        const activeMemberCount = members.filter((m: any) => m.status === 'active').length;
        const approvedProjectCount = projects.filter((p: any) => Boolean(p.isApproved)).length;
        const showcaseReadyProjectCount = projects.filter(
            (p: any) => p.status === 'demo_ready' || Boolean(p.submittedToShowcase)
        ).length;

        const responseCollege = {
            ...college,
            memberCount,
            activeMemberCount,
            projectCount: projects.length,
            approvedProjectCount,
            showcaseReadyProjectCount,
        };

        return NextResponse.json(
            { success: true, college: responseCollege, members, projects, recentUpdates },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching college pod:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
