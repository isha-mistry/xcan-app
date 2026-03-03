import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ProgramMilestone } from '@/models/ProgramMilestone';
import { College } from '@/models/College';
import { PodMember } from '@/models/PodMember';
import { ShowcaseEvent } from '@/models/ShowcaseEvent';

// GET /api/builder-pods/analytics/milestones — KPI vs target
export async function GET() {
    try {
        await dbConnect();

        const [milestones, labCount, podCount, studentCount, showcaseCount] = await Promise.all([
            ProgramMilestone.find().sort({ milestoneNumber: 1 }).lean(),
            College.countDocuments({ deletedAt: null }),
            College.countDocuments({ status: 'active', deletedAt: null }),
            PodMember.countDocuments({ status: 'active' }),
            ShowcaseEvent.countDocuments({ status: 'completed' }),
        ]);

        const actual = { labs: labCount, pods: podCount, students: studentCount, showcases: showcaseCount };

        const enriched = milestones.map((m: any) => ({
            ...m,
            actual: {
                labs: Math.min(actual.labs, m.targetLabs ?? actual.labs),
                pods: Math.min(actual.pods, m.targetPods ?? actual.pods),
                students: Math.min(actual.students, m.targetStudents ?? actual.students),
                showcases: Math.min(actual.showcases, m.targetShowcases ?? actual.showcases),
            },
        }));

        return NextResponse.json({ success: true, milestones: enriched, actual }, { status: 200 });
    } catch (error) {
        console.error('Analytics milestones error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
