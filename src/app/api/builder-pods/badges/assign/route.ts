import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { assignBadgeManually } from '@/lib/builder-pods/badges';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';

// POST /api/builder-pods/badges/assign — manual badge assignment
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { badgeSlug, walletAddress, adminWallet, collegeId, showcaseEventId } = body;

        if (!badgeSlug || !walletAddress || !adminWallet) {
            return NextResponse.json(
                { success: false, error: 'badgeSlug, walletAddress, and adminWallet are required' },
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
        console.error('Badge assignment error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
