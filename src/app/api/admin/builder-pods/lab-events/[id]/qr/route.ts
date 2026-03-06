import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { LabEvent } from '@/models/LabEvent';

/**
 * GET /api/admin/builder-pods/lab-events/:id/qr
 * Returns a QR code image (PNG data URL) for the given lab event.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;

        const event = await LabEvent.findById(id);
        if (!event) {
            return NextResponse.json(
                { success: false, error: 'Lab event not found' },
                { status: 404 }
            );
        }

        // Generate QR code for the registration URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const registrationUrl = `${appUrl}/builder-pods/register?token=${event.qrToken}`;

        try {
            const { generateLabEventQR } = await import('@/lib/builder-pods/qr');
            const qrDataUrl = await generateLabEventQR(event.qrToken);

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
        } catch (qrError: any) {
            // Fallback: return the raw token/URL without QR image
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
                        notice: 'QR generation unavailable — use registration URL directly',
                    },
                },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error('QR generation error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
