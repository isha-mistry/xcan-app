import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { LabEvent } from '@/models/LabEvent';
import { College } from '@/models/College';
import { AuditLog } from '@/models/AuditLog';
import {
    getAuthContext, requireAnyRole,
    buildCollegeFilter, verifyCollegeAccess,
    UnauthorizedError, ForbiddenError
} from '@/lib/rbac';
import crypto from 'crypto';
import { BASE_URL } from '@/config/constants';

// GET — list all lab events
// super_admin sees all, college_admin sees only their college's events
export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin']);

        await dbConnect();

        const collegeFilter = buildCollegeFilter(ctx!);

        const events = await LabEvent.find(collegeFilter)
            .populate('collegeId', 'name slug city state')
            .sort({ eventDate: -1 })
            .lean();

        // Attach registration URL to each event
        const appUrl = BASE_URL;
        const eventsWithUrls = events.map((e: any) => ({
            ...e,
            registrationUrl: `${appUrl}/builder-pods/register?token=${e.qrToken}`,
        }));

        console.log("eventsWithUrls", eventsWithUrls);

        return NextResponse.json({ success: true, events: eventsWithUrls }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('Lab events list error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST — create a lab event + QR token
// super_admin can create for any college, college_admin only for their own
export async function POST(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin']);

        await dbConnect();
        const body = await req.json();
        const { collegeSlug, eventName, eventDate, city, state, expectedAttendees, milestoneNumber } = body;
        const adminWallet = ctx!.walletAddress;

        if (!collegeSlug || !eventName) {
            return NextResponse.json(
                { success: false, error: 'collegeSlug and eventName are required' },
                { status: 400 }
            );
        }

        const college = await College.findOne({ slug: collegeSlug, deletedAt: null });
        if (!college) {
            return NextResponse.json({ success: false, error: 'College not found' }, { status: 404 });
        }

        // Verify college-scoped access
        verifyCollegeAccess(ctx!, college._id.toString());

        // Generate secure random QR token
        const qrToken = crypto.randomBytes(16).toString('hex');
        const appUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL || 'http://localhost:3000';

        const event = await LabEvent.create({
            collegeId: college._id,
            eventName: eventName.trim(),
            eventDate: eventDate ? new Date(eventDate) : new Date(),
            city: city || college.city,
            state: state || college.state,
            expectedAttendees: expectedAttendees || null,
            qrToken,
            qrIsActive: true,
            qrExpiresAt: null,
            actualAttendees: 0,
            createdBy: adminWallet,
            milestoneNumber: milestoneNumber || null,
        });

        await AuditLog.create({
            actorWallet: adminWallet,
            action: 'lab_event.create',
            entityType: 'LabEvent',
            entityId: event._id.toString(),
            newValue: { eventName, collegeSlug, qrToken },
        });

        return NextResponse.json(
            {
                success: true,
                event: {
                    _id: event._id,
                    eventName: event.eventName,
                    qrToken: event.qrToken,
                    registrationUrl: `${appUrl}/builder-pods/register?token=${qrToken}`,
                    qrImageUrl: `/api/admin/builder-pods/lab-events/${event._id}/qr`,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: error.message }, { status: 403 });
        console.error('Lab event creation error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
