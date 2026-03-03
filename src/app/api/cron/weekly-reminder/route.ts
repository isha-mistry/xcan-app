import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { PodMember } from '@/models/PodMember';
import { WeeklyUpdate } from '@/models/WeeklyUpdate';
import { Notification } from '@/models/Notification';

function getCurrentWeekInfo(): { weekNumber: number; year: number } {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
        ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    return { weekNumber, year: now.getFullYear() };
}

// Cron: Monday 9am IST = 3:30am UTC (30 3 * * 1)
export async function GET() {
    try {
        await dbConnect();
        const { weekNumber, year } = getCurrentWeekInfo();

        const podsMissingUpdate = await College.aggregate([
            { $match: { status: 'active', deletedAt: null } },
            {
                $lookup: {
                    from: 'weeklyupdates',
                    let: { cid: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$collegeId', '$$cid'] },
                                        { $eq: ['$weekNumber', weekNumber] },
                                        { $eq: ['$year', year] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'thisWeekUpdate',
                },
            },
            { $match: { thisWeekUpdate: { $size: 0 } } },
            { $project: { _id: 1, name: 1, slug: 1 } },
        ]);

        let notificationCount = 0;

        for (const pod of podsMissingUpdate) {
            const leads = await PodMember.find(
                { collegeId: pod._id, role: 'tech_lead', status: 'active' },
                'walletAddress'
            ).lean();

            const notifications = leads.map((lead) => ({
                walletAddress: lead.walletAddress,
                type: 'weekly_update_due' as const,
                title: `Weekly Update Due — ${pod.name}`,
                body: `Your pod hasn't submitted this week's update yet. Please submit before Sunday.`,
                link: `/builder-pods/${pod.slug}`,
            }));

            if (notifications.length) {
                await Notification.insertMany(notifications, { ordered: false });
                notificationCount += notifications.length;
            }
        }

        return NextResponse.json({
            success: true,
            podsMissingUpdate: podsMissingUpdate.length,
            notificationsSent: notificationCount,
        });
    } catch (error) {
        console.error('Cron weekly-reminder error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
