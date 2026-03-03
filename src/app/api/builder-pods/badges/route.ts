import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { BadgeType } from '@/models/BadgeType';

export async function GET() {
    try {
        await dbConnect();

        const badges = await BadgeType.find()
            .select('slug label description iconUrl category isAutoAwarded triggerEvent')
            .sort({ slug: 1 })
            .lean();

        return NextResponse.json({ success: true, badges }, { status: 200 });
    } catch (error) {
        console.error('Error fetching badge types:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
