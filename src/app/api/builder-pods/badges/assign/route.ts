import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { assignBadgeManually } from '@/lib/builder-pods/badges';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import { ForbiddenError, getAuthContext, requireRole, UnauthorizedError } from '@/lib/rbac';

// POST /api/builder-pods/badges/assign — manual badge assignment
export async function POST(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireRole(ctx, 'super_admin');

        await dbConnect();
        const body = await req.json();
        const { badgeSlug, walletAddress, collegeId, showcaseEventId } = body;
        const adminWallet = ctx!.walletAddress;

        if (!badgeSlug || !walletAddress) {
            return NextResponse.json(
                { success: false, error: 'badgeSlug and walletAddress are required' },
                { status: 400 }
            );
        }

        await assignBadgeManually(
            badgeSlug,
            walletAddress.toLowerCase(),
            adminWallet.toLowerCase(),
            { collegeId, showcaseEventId }
        );

        // Notification
        await Notification.create({
            walletAddress: walletAddress.toLowerCase(),
            type: 'badge_awarded',
            title: 'Badge Awarded! 🎖️',
            body: `You received the ${badgeSlug.replace(/_/g, ' ')} badge.`,
            link: '/profile',
        });

        // Audit
        await AuditLog.create({
            actorWallet: adminWallet.toLowerCase(),
            action: 'badge.manual_assign',
            entityType: 'UserBadge',
            entityId: walletAddress.toLowerCase(),
            newValue: { badgeSlug, walletAddress: walletAddress.toLowerCase() },
        });

        return NextResponse.json({ success: true, badgeSlug }, { status: 201 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }
        console.error('Badge assignment error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
