import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireRole } from '@/lib/rbac';
import { seedBuilderPods } from '@/lib/builder-pods/seed';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (_req: NextRequest, ctx) => {
    requireRole(ctx, 'super_admin');
    const result = await seedBuilderPods();
    return NextResponse.json({ success: true, result });
});

