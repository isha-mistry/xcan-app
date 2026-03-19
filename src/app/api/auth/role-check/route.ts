import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, isSuperAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
    const ctx = await getAuthContext(req);
    return NextResponse.json({
        isSuperAdmin: ctx ? isSuperAdmin(ctx) : false,
    });
}
