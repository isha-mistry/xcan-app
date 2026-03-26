import { ProgramMilestone } from '@/models/ProgramMilestone';
import { LabEvent } from '@/models/LabEvent';
import { College } from '@/models/College';
import { PodMember } from '@/models/PodMember';
import { PodProject } from '@/models/PodProject';
import { ShowcaseEvent } from '@/models/ShowcaseEvent';

export async function getMilestoneKPIs() {
    const [
        milestones,
        labCount,
        podCount,
        studentCount,
        projectCount,
        pendingProjectCount,
        showcaseCount,
    ] =
        await Promise.all([
            ProgramMilestone.find().sort({ milestoneNumber: 1 }).lean(),
            LabEvent.countDocuments(),
            College.countDocuments({ status: { $in: ['active', 'alumni'] }, deletedAt: null }),
            PodMember.countDocuments({ deletedAt: null }),
            PodProject.countDocuments({ deletedAt: null }),
            PodProject.countDocuments({ deletedAt: null, isApproved: false }),
            ShowcaseEvent.countDocuments({ status: 'completed' }),
        ]);

    return {
        live: { labCount, podCount, studentCount, projectCount, pendingProjectCount, showcaseCount },
        milestones: milestones.map((milestone: any) => ({
            ...milestone,
            progress: {
                labs: milestone.targetLabs
                    ? Math.min(100, Math.round((labCount / milestone.targetLabs) * 100))
                    : null,
                pods: milestone.targetPods
                    ? Math.min(100, Math.round((podCount / milestone.targetPods) * 100))
                    : null,
                students: milestone.targetStudents
                    ? Math.min(100, Math.round((studentCount / milestone.targetStudents) * 100))
                    : null,
                showcases: milestone.targetShowcases
                    ? Math.min(100, Math.round((showcaseCount / milestone.targetShowcases) * 100))
                    : null,
            },
        })),
    };
}
