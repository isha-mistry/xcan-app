import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ShowcaseEvent } from '@/models/ShowcaseEvent';
import { Region } from '@/models/Region';
import { ShowcaseSubmission } from '@/models/ShowcaseSubmission';
import {
    getAuthContext, requireAnyRole,
    UnauthorizedError, ForbiddenError
} from '@/lib/rbac';

// PATCH — update showcase event
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin', 'mentor']);

        const { id } = params;
        await dbConnect();
        const body = await req.json();

        const event = await ShowcaseEvent.findById(id);
        if (!event) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }

        // If region changed, update snapshot
        if (body.regionId && body.regionId !== event.regionId.toString()) {
            const region = await Region.findById(body.regionId);
            if (region) {
                event.regionId = body.regionId;
                event.regionSnapshot = {
                    name: region.name,
                    showcaseCity: region.showcaseCity,
                };
            }
        }

        if (body.name) event.name = body.name;
        if (body.city) event.city = body.city;
        if (body.eventDate) event.eventDate = new Date(body.eventDate);
        if (body.venue !== undefined) event.venue = body.venue;
        if (body.status) event.status = body.status;
        if (body.prizePoolUsd !== undefined) event.prizePoolUsd = body.prizePoolUsd;

        await event.save();

        return NextResponse.json({ success: true, event }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE — remove showcase event
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin']); // Only super_admin can delete

        const { id } = params;
        await dbConnect();
        
        // Cascade delete submissions
        await ShowcaseSubmission.deleteMany({ showcaseEventId: id });
        await ShowcaseEvent.findByIdAndDelete(id);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
