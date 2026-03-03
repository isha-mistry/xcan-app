import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';

export async function GET() {
    try {
        await dbConnect();

        const data = await College.aggregate([
            { $match: { deletedAt: null } },
            {
                $group: {
                    _id: '$regionSnapshot.name',
                    showcaseCity: { $first: '$regionSnapshot.showcaseCity' },
                    colleges: { $sum: 1 },
                    members: { $sum: '$memberCount' },
                    deployments: { $sum: '$deploymentCount' },
                },
            },
            {
                $project: {
                    _id: 0,
                    regionName: '$_id',
                    showcaseCity: 1,
                    colleges: 1,
                    members: 1,
                    deployments: 1,
                },
            },
            { $sort: { colleges: -1 } },
        ]);

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error('Error fetching region breakdown:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
