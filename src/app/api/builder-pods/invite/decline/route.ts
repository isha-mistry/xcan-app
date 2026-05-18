import { NextRequest } from 'next/server';
import { handleInviteResponse } from '@/lib/builder-pods/pod-member-invite/handle-response';

export const dynamic = 'force-dynamic';

/** Legacy path — same handler as /builder-pods/invite/decline */
export async function GET(req: NextRequest) {
    return handleInviteResponse(req, 'decline');
}
