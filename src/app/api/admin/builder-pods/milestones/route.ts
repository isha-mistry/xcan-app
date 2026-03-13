import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getMilestoneKPIs } from '@/lib/builder-pods/milestones';
import { ForbiddenError, getAuthContext, requireRole, UnauthorizedError } from '@/lib/rbac';

// GET /api/admin/builder-pods/milestones — internal KPI tracker
export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireRole(ctx, 'super_admin');

        await dbConnect();
        const data = await getMilestoneKPIs();

        return NextResponse.json({ success: true, ...data }, { status: 200 });
    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }
        console.error('Admin milestones error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
