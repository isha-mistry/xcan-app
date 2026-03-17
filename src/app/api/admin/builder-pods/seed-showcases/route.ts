import { NextRequest, NextResponse } from 'next/server';
import { requireRole, getAuthContext } from '@/lib/rbac';
import { seedBuilderPods } from '@/lib/builder-pods/seed';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const ctx = await getAuthContext(req);
        requireRole(ctx, 'super_admin');
        const result = await seedBuilderPods();
        return NextResponse.json({ success: true, result }, { status: 200 });
    } catch (err: any) {
        console.error('[seed-showcases] Error seeding showcases', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Failed to seed showcases' },
            { status: err?.statusCode || 500 }
        );
    }
}

