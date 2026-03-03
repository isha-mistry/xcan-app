import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { WeeklyUpdate } from '@/models/WeeklyUpdate';

export async function GET() {
    try {
        await dbConnect();

        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

        const data = await WeeklyUpdate.aggregate([
            { $match: { createdAt: { $gte: eightWeeksAgo } } },
            {
                $group: {
                    _id: { weekNumber: '$weekNumber', year: '$year' },
                    updatesSubmitted: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.weekNumber': 1 } },
            {
                $project: {
                    _id: 0,
                    weekLabel: {
                        $concat: ['W', { $toString: '$_id.weekNumber' }, '-', { $toString: '$_id.year' }],
                    },
                    updatesSubmitted: 1,
                },
            },
        ]);

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error('Error fetching weekly activity:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
