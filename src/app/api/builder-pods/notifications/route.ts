import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Notification } from '@/models/Notification';
import { getAuthContext, UnauthorizedError } from '@/lib/rbac';

// GET /api/builder-pods/notifications — current user's Builder Pods notifications
export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        if (!ctx) throw new UnauthorizedError('Not authenticated');

        await dbConnect();

        const wallet = ctx.walletAddress.toLowerCase();
        const limit = Math.min(
            50,
            Math.max(1, Number(req.nextUrl.searchParams.get('limit') || 25))
        );

        const podNotificationTypes = [
            'badge_awarded',
            'member_approved',
            'weekly_update_due',
            'deployment_verified',
            'showcase_result',
            'showcase_finalist',
            'showcase_winner',
            'project_status_changed',
            'role_assigned',
        ];

        const typeFilter = req.nextUrl.searchParams.get('type');
        const filter: Record<string, unknown> = { walletAddress: wallet };

        if (typeFilter === 'pod') {
            filter.type = { $in: podNotificationTypes };
        } else if (typeFilter) {
            filter.type = typeFilter;
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ success: true, notifications }, {
            status: 200,
            headers: {
                'Cache-Control': 'private, max-age=15, stale-while-revalidate=30',
            },
        });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }
        console.error('Error fetching builder pods notifications:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

