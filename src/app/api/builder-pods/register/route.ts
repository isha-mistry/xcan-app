import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { PodMember } from '@/models/PodMember';
import { LabEvent } from '@/models/LabEvent';
import { AuditLog } from '@/models/AuditLog';
import { awardBadgeOnEvent } from '@/lib/builder-pods/badges';
import { getAuthContext, UnauthorizedError } from '@/lib/rbac';
import { RegisterSchema } from '@/schemas/builder-pods';

export async function POST(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        if (!ctx) throw new UnauthorizedError('Not authenticated');

        await dbConnect();

        const parsed = RegisterSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || 'Invalid registration payload' },
                { status: 400 }
            );
        }
        const walletAddress = ctx.walletAddress;
        const {
            name,
            collegeSlug,
            programmingLevel,
            githubUsername,
            semester,
            qrToken,
        } = parsed.data;

        const college = await College.findOne({ slug: collegeSlug, deletedAt: null });
        if (!college) {
            return NextResponse.json(
                { success: false, error: 'College not found' },
                { status: 404 }
            );
        }

        // Check for duplicate registration
        const existing = await PodMember.findOne({
            collegeId: college._id,
            walletAddress: walletAddress.toLowerCase(),
        });
        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Already registered with this college' },
                { status: 409 }
            );
        }

        // QR validation (optional)
        let qrEventId = null;
        let joinedViaQr = false;
        if (qrToken) {
            const event = await LabEvent.findOne({
                qrToken,
                qrIsActive: true,
                collegeId: college._id,
            });
            if (!event) {
                return NextResponse.json(
                    { success: false, error: 'Invalid QR code for this college' },
                    { status: 404 }
                );
            }
            if (event.qrExpiresAt && new Date() > event.qrExpiresAt) {
                return NextResponse.json(
                    { success: false, error: 'QR code has expired' },
                    { status: 410 }
                );
            }
            qrEventId = event._id;
            joinedViaQr = true;
            // Increment attendee count
            await LabEvent.findByIdAndUpdate(event._id, {
                $inc: { actualAttendees: 1 },
            });
        }

        const member = await PodMember.create({
            collegeId: college._id,
            walletAddress,
            name: name.trim(),
            programmingLevel: programmingLevel || null,
            githubUsername: githubUsername || null,
            semester: semester || null,
            status: 'pending',
            joinedViaQr,
            qrEventId,
        });

        // Update college member count
        await College.findByIdAndUpdate(college._id, {
            $inc: { memberCount: 1 },
        });

        // Auto-award badges
        if (joinedViaQr) {
            await awardBadgeOnEvent('lab_registration', walletAddress, {
                collegeId: college._id.toString(),
            });
        }

        await AuditLog.create({
            actorWallet: walletAddress,
            action: 'member.register',
            entityType: 'PodMember',
            entityId: member._id.toString(),
            newValue: {
                collegeSlug,
                joinedViaQr,
            },
        });

        return NextResponse.json(
            { success: true, member: { _id: member._id, status: member.status, joinedViaQr } },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: 'Already registered with this college' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const token = req.nextUrl.searchParams.get('token');

        if (token) {
            const event = await LabEvent.findOne({ qrToken: token, qrIsActive: true })
                .populate('collegeId', 'name slug city state')
                .lean() as any;

            if (!event || !event.collegeId) {
                return NextResponse.json(
                    { success: false, error: 'Invalid or expired QR token' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                collegeSlug: event.collegeId.slug,
                collegeName: event.collegeId.name,
                eventName: event.eventName,
            }, { status: 200 });
        }

        const colleges = await College.find({ deletedAt: null, status: 'active' })
            .select('name slug city state')
            .sort({ name: 1 })
            .lean();

        return NextResponse.json({ success: true, colleges }, { status: 200 });
    } catch (error) {
        console.error('Error fetching colleges for registration:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
