import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { AuditLog } from '@/models/AuditLog';

// GET /api/admin/builder-pods/audit-logs — paginated audit trail
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const action = searchParams.get('action');
        const actor = searchParams.get('actor');

        const filter: Record<string, any> = {};
        if (action) filter.action = { $regex: action, $options: 'i' };
        if (actor) filter.actorWallet = actor.toLowerCase();

        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            AuditLog.countDocuments(filter),
        ]);

        return NextResponse.json({
            success: true,
            logs,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        }, { status: 200 });
    } catch (error) {
        console.error('Audit logs error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
