/**
 * QR Code generation for Builder Lab events.
 * Uses the qrcode npm package if available, otherwise returns a URL string.
 */

export async function generateLabEventQR(qrToken: string): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://xcan.app';
    const registrationUrl = `${baseUrl}/builder-pods/register?token=${qrToken}`;

    try {
        // Dynamic require to avoid type errors when qrcode is not installed
        const QRCode = require('qrcode');
        return await QRCode.toDataURL(registrationUrl, {
            errorCorrectionLevel: 'H',
            width: 512,
            margin: 2,
            color: { dark: '#1a1a2e', light: '#ffffff' },
        });
    } catch {
        // If qrcode package is not installed, return the URL directly
        return registrationUrl;
    }
}

export function getRegistrationUrl(qrToken: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://xcan.app';
    return `${baseUrl}/builder-pods/register?token=${qrToken}`;
}
