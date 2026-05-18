import { NextRequest } from 'next/server';
import { handleInviteResponse } from '@/lib/builder-pods/pod-member-invite/handle-response';

export const dynamic = 'force-dynamic';

/** Public RSVP — Yes (no app layout, works from email links). */
export async function GET(req: NextRequest) {
    return handleInviteResponse(req, 'accept');
}
