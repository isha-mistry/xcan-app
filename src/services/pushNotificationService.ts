interface PushNotificationPayload {
  title: string;
  body: string;
  data?: any;
}

// Utility function to convert VAPID key
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check if push notifications are supported
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications not supported');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    // Ensure service worker is registered
    const registration = await registerServiceWorker();
    if (!registration) {
      console.warn('Service worker not registered');
      return null;
    }

    // Check permission
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      console.warn('Notification permission denied');
      return null;
    }

    // Subscribe to push notifications
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

// Send push notification subscription to server
export async function sendSubscriptionToServer(
  subscription: PushSubscription, 
  payload?: any
): Promise<boolean> {
  try {
    const response = await fetch('/api/push-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        subscription, 
        payload 
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send subscription to server:', error);
    return false;
  }
}

// Send push notification
export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    // Ensure notifications are supported and permitted
    if (!await requestNotificationPermission()) {
      console.warn('Notification permission not granted');
      return false;
    }

    // Get or create subscription
    const subscription = await subscribeToPushNotifications();
    if (!subscription) {
      console.warn('Could not create push subscription');
      return false;
    }

    // Send to server
    return await sendSubscriptionToServer(subscription, payload);
  } catch (error) {
    console.error('Push notification sending failed:', error);
    return false;
  }
}

// Check if notifications are ready
export async function ensureNotificationReady(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications not supported');
    return false;
  }

  const permissionGranted = await requestNotificationPermission();
  const registration = await registerServiceWorker();

  return permissionGranted && !!registration;
}