import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { PodMember } from '@/models/PodMember';
import { LabEvent } from '@/models/LabEvent';
import { awardBadgeOnEvent } from '@/lib/builder-pods/badges';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const {
            walletAddress,
            name,
            collegeSlug,
            programmingLevel,
            githubUsername,
            semester,
            qrToken,
        } = body;

        if (!walletAddress || !/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) {
            return NextResponse.json(
                { success: false, error: 'Connect your wallet to register' },
                { status: 400 }
            );
        }

        if (!name || !collegeSlug) {
            return NextResponse.json(
                { success: false, error: 'name and collegeSlug are required' },
                { status: 400 }
            );
        }

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
            if (event) {
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
        }

        const member = await PodMember.create({
            collegeId: college._id,
            walletAddress: walletAddress.toLowerCase(),
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
            await awardBadgeOnEvent('lab_registration', walletAddress.toLowerCase(), {
                collegeId: college._id.toString(),
            });
        }

        return NextResponse.json(
            { success: true, member: { _id: member._id, status: member.status, joinedViaQr } },
            { status: 201 }
        );
    } catch (error: any) {
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
