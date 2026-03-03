import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { LabEvent } from '@/models/LabEvent';
import { College } from '@/models/College';
import { AuditLog } from '@/models/AuditLog';
import crypto from 'crypto';

// GET — list all lab events
export async function GET() {
    try {
        await dbConnect();
        const events = await LabEvent.find()
            .populate('collegeId', 'name slug')
            .sort({ eventDate: -1 })
            .lean();
        return NextResponse.json({ success: true, events }, { status: 200 });
    } catch (error) {
        console.error('Lab events list error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST — create a lab event + QR token
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { collegeSlug, eventTitle, eventDate, venue, expectedAttendees, adminWallet } = body;

        if (!collegeSlug || !eventTitle || !adminWallet) {
            return NextResponse.json(
                { success: false, error: 'collegeSlug, eventTitle, and adminWallet are required' },
                { status: 400 }
            );
        }

        const college = await College.findOne({ slug: collegeSlug, deletedAt: null });
        if (!college) {
            return NextResponse.json({ success: false, error: 'College not found' }, { status: 404 });
        }

        // Generate secure QR token
        const qrToken = crypto.randomBytes(16).toString('hex');

        const event = await LabEvent.create({
            collegeId: college._id,
            title: eventTitle.trim(),
            eventDate: eventDate ? new Date(eventDate) : null,
            venue: venue || null,
            expectedAttendees: expectedAttendees || null,
            qrToken,
            qrIsActive: true,
            qrExpiresAt: null,
            actualAttendees: 0,
            createdBy: adminWallet.toLowerCase(),
        });

        await AuditLog.create({
            actorWallet: adminWallet.toLowerCase(),
            action: 'lab_event.create',
            entityType: 'LabEvent',
            entityId: event._id.toString(),
            newValue: { title: eventTitle, collegeSlug, qrToken },
        });

        return NextResponse.json(
            {
                success: true,
                event: {
                    _id: event._id,
                    title: event.title,
                    qrToken: event.qrToken,
                    qrUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/builder-pods/register?qr=${qrToken}`,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Lab event creation error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
