import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { Region } from '@/models/Region';
import { AuditLog } from '@/models/AuditLog';

// GET — list all colleges (admin view)
export async function GET() {
    try {
        await dbConnect();

        const colleges = await College.find({ deletedAt: null })
            .sort({ name: 1 })
            .lean();

        return NextResponse.json({ success: true, colleges }, { status: 200 });
    } catch (error) {
        console.error('Admin colleges error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// POST — create a new college
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const {
            name, city, state, stateCode, regionId, podName,
            facultyName, adminWallet,
        } = body;

        if (!name || !city || !state || !regionId || !podName || !adminWallet) {
            return NextResponse.json(
                { success: false, error: 'name, city, state, regionId, podName, adminWallet are required' },
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
            actorWallet: adminWallet.toLowerCase(),
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
        console.error('Create college error:', error);
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: 'A college with this slug already exists' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// PATCH — update college or toggle status
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { collegeId, adminWallet, ...updates } = body;

        if (!collegeId || !adminWallet) {
            return NextResponse.json(
                { success: false, error: 'collegeId and adminWallet are required' },
                { status: 400 }
            );
        }

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

        // If activating, set activatedAt
        if (updates.status === 'active' && !college.activatedAt) {
            college.activatedAt = new Date();
        }

        await college.save();

        await AuditLog.create({
            actorWallet: adminWallet.toLowerCase(),
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
    } catch (error) {
        console.error('Update college error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
