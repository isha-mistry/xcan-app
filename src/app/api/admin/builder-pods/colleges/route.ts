import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { Region } from '@/models/Region';
import { AuditLog } from '@/models/AuditLog';
import {
    getAuthContext, requireRole, requireAnyRole,
    buildCollegeFilter, verifyCollegeAccess,
    UnauthorizedError, ForbiddenError
} from '@/lib/rbac';

// GET — list colleges (admin view)
// super_admin sees all, college_admin sees only their own college(s)
export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin']);

        await dbConnect();

        // College-scoped filter
        const filter = { deletedAt: null, ...buildCollegeFilter(ctx!, '_id') };

        const colleges = await College.find(filter)
            .sort({ name: 1 })
            .lean();

        return NextResponse.json({ success: true, colleges }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('Admin colleges error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST — create a new college (super_admin only)
export async function POST(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireRole(ctx, 'super_admin');

        await dbConnect();
        const body = await req.json();
        const { name, city, state, stateCode, regionId, podName, facultyName } = body;
        const adminWallet = ctx!.walletAddress;

        if (!name || !city || !state || !regionId || !podName) {
            return NextResponse.json(
                { success: false, error: 'name, city, state, regionId, podName are required' },
                { status: 400 }
            );
        }

        const region = await Region.findById(regionId);
        if (!region) {
            return NextResponse.json(
                { success: false, error: 'Region not found' },
                { status: 404 }
            );
        }

        const college = new College({
            name,
            city,
            state,
            stateCode: stateCode || state.slice(0, 2).toUpperCase(),
            regionId,
            regionSnapshot: { name: region.name, showcaseCity: region.showcaseCity },
            podName,
            facultyName: facultyName || null,
            status: 'inactive',
        });

        await college.save();

        await AuditLog.create({
            actorWallet: adminWallet,
            action: 'college.create',
            entityType: 'College',
            entityId: college._id.toString(),
            newValue: { name, slug: college.slug, city, state },
        });

        return NextResponse.json(
            { success: true, college: { _id: college._id, slug: college.slug } },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        console.error('Create college error:', error);
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: 'A college with this slug already exists' },
                { status: 409 }
            );
        }
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH — update college or toggle status
// super_admin can update any college, college_admin can update their own
export async function PATCH(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin']);

        await dbConnect();
        const body = await req.json();
        const { collegeId, ...updates } = body;
        const adminWallet = ctx!.walletAddress;

        if (!collegeId) {
            return NextResponse.json(
                { success: false, error: 'collegeId is required' },
                { status: 400 }
            );
        }

        // Verify college-scoped access
        verifyCollegeAccess(ctx!, collegeId);

        const college = await College.findById(collegeId);
        if (!college) {
            return NextResponse.json(
                { success: false, error: 'College not found' },
                { status: 404 }
            );
        }

        const oldValues: Record<string, any> = {};
        const allowedFields = ['name', 'city', 'state', 'stateCode', 'podName', 'facultyName', 'status'];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                oldValues[field] = (college as any)[field];
                (college as any)[field] = updates[field];
            }
        }

        if (updates.status === 'active' && !college.activatedAt) {
            college.activatedAt = new Date();
        }

        await college.save();

        await AuditLog.create({
            actorWallet: adminWallet,
            action: 'college.update',
            entityType: 'College',
            entityId: collegeId,
            oldValue: oldValues,
            newValue: updates,
        });

        return NextResponse.json(
            { success: true, college: { _id: college._id, slug: college.slug, status: college.status } },
            { status: 200 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: error.message }, { status: 403 });
        console.error('Update college error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
