// app/api/push-notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure VAPID keys
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// POST handler for registering subscription
export async function POST(request: NextRequest) {
  try {
    const { subscription, payload } = await request.json();

    // Validate input
    if (!subscription || !payload) {
      return NextResponse.json(
        { error: 'Subscription and payload are required' }, 
        { status: 400 }
      );
    }

    // Send push notification
    await webpush.sendNotification(
      subscription, 
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        data: payload.data || {}
      })
    );

    return NextResponse.json(
      { message: 'Notification sent successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Push notification error:', error);

    // Handle specific types of errors
    if (error instanceof Error) {
      if (error.message.includes('subscription not found')) {
        return NextResponse.json(
          { error: 'Subscription expired or invalid' }, 
          { status: 410 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to send notification' }, 
      { status: 500 }
    );
  }
}