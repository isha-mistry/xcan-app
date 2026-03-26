import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { LabEvent } from '@/models/LabEvent';
import {
    getAuthContext, requireAnyRole, verifyCollegeAccess,
    UnauthorizedError, ForbiddenError
} from '@/lib/rbac';

/**
 * GET /api/admin/builder-pods/lab-events/:id/qr
 * Returns a QR code data URL (PNG) for the lab event registration page.
 * Allowed: super_admin, college_admin (own college only)
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ctx = await getAuthContext(req);
        requireAnyRole(ctx, ['super_admin', 'college_admin']);

        await dbConnect();
        const { id } = params;

        const event = await LabEvent.findById(id);
        if (!event) {
            return NextResponse.json(
                { success: false, error: 'Lab event not found' },
                { status: 404 }
            );
        }

        // Verify college-scoped access
        verifyCollegeAccess(ctx!, event.collegeId.toString());

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_LOCAL_BASE_URL || 'http://localhost:3000';
        const registrationUrl = `${appUrl}/builder-pods/register?token=${event.qrToken}`;

        try {
            // Dynamically import qrcode (optional dependency)
            const QRCode = await import('qrcode');
            const qrDataUrl = await QRCode.toDataURL(registrationUrl, {
                width: 400,
                margin: 2,
                color: { dark: '#000000', light: '#FFFFFF' },
            });

            return NextResponse.json(
                {
                    success: true,
                    qr: {
                        dataUrl: qrDataUrl,
                        registrationUrl,
                        token: event.qrToken,
                        eventName: event.eventName,
                        isActive: event.qrIsActive,
                        expiresAt: event.qrExpiresAt,
                    },
                },
                { status: 200 }
            );
        } catch {
            // qrcode not installed — return raw URL with instructions
            return NextResponse.json(
                {
                    success: true,
                    qr: {
                        dataUrl: null,
                        registrationUrl,
                        token: event.qrToken,
                        eventName: event.eventName,
                        isActive: event.qrIsActive,
                        expiresAt: event.qrExpiresAt,
                        notice: 'Install qrcode package: yarn add qrcode',
                    },
                },
                { status: 200 }
            );
        }
    } catch (error: any) {
        if (error instanceof UnauthorizedError) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        if (error instanceof ForbiddenError) return NextResponse.json({ success: false, error: error.message }, { status: 403 });
        console.error('QR generation error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
