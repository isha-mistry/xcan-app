import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { checkRateLimit } from '@/lib/rate-limit';
import {
    findMemberByInviteToken,
    acceptPodMemberInvite,
    declinePodMemberInvite,
} from '@/lib/builder-pods/pod-member-invite/service';
import { buildInviteResponsePage } from '@/lib/builder-pods/pod-member-invite/response-page';

export const dynamic = 'force-dynamic';

function htmlResponse(body: string, status: number) {
    return new NextResponse(body, {
        status,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
        },
    });
}

const ERROR_COPY = {
    invalid: {
        title: 'Invalid link',
        message: 'This invitation link is not valid.',
        detail: 'Use the Yes or No buttons in your latest invitation email.',
    },
    expired: {
        title: 'Invitation expired',
        message: 'This Pod Member invitation has expired.',
        detail: 'Ask your pod lead to send a new invitation.',
    },
    already_answered: {
        title: 'Already responded',
        message: 'You have already answered this invitation.',
        detail: 'No further action is needed.',
    },
} as const;

/** Core RSVP handler — used by public invite routes and legacy API routes. */
export async function processInviteResponse(
    token: string | null | undefined,
    action: 'accept' | 'decline',
    clientIp = 'unknown',
): Promise<NextResponse> {
    try {
        let trimmed = token?.trim();
        if (trimmed) {
            try {
                trimmed = decodeURIComponent(trimmed);
            } catch {
                /* use as-is */
            }
        }
        if (!trimmed) {
            return htmlResponse(
                buildInviteResponsePage({
                    variant: 'error',
                    title: 'Missing link',
                    message: 'Open the Yes or No button from your invitation email.',
                }),
                400,
            );
        }

        const limit = checkRateLimit(`pod-invite:${clientIp}`, 30, 60_000);
        if (!limit.allowed) {
            return htmlResponse(
                buildInviteResponsePage({
                    variant: 'error',
                    title: 'Too many attempts',
                    message: 'Please wait a minute and try again.',
                }),
                429,
            );
        }

        await dbConnect();
        const lookup = await findMemberByInviteToken(trimmed);

        if (!lookup.ok) {
            const copy = ERROR_COPY[lookup.reason];
            // Always 200 so the browser shows our message, not the site-wide Next.js 404 page.
            return htmlResponse(
                buildInviteResponsePage({ variant: 'error', ...copy }),
                200,
            );
        }

        if (action === 'accept') {
            await acceptPodMemberInvite(lookup.member);
            return htmlResponse(
                buildInviteResponsePage({
                    variant: 'accepted',
                    title: "You're confirmed!",
                    message: `You are now a Pod Member for ${lookup.podName}.`,
                    detail: 'Your on-chain badge will be issued shortly.',
                }),
                200,
            );
        }

        await declinePodMemberInvite(lookup.member);
        return htmlResponse(
            buildInviteResponsePage({
                variant: 'declined',
                title: 'Invitation declined',
                message: 'Your response was recorded.',
                detail: 'You remain in your current role.',
            }),
            200,
        );
    } catch (err) {
        console.error('[pod-member-invite] response error:', err);
        return htmlResponse(
            buildInviteResponsePage({
                variant: 'error',
                title: 'Something went wrong',
                message: 'We could not save your response.',
                detail: 'Please try the link in your email again.',
            }),
            500,
        );
    }
}

export async function handleInviteResponse(
    req: NextRequest,
    action: 'accept' | 'decline',
): Promise<NextResponse> {
    const token = new URL(req.url).searchParams.get('token');
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    return processInviteResponse(token, action, ip);
}
