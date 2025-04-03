interface PushNotificationPayload {
  title: string;
  body: string;
  data?: any;
}

// Push notification service class
export class PushNotificationService {
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private vapidKeyArray: Uint8Array | null = null;
  private permissionStatus: NotificationPermission | null = null;
  
  constructor(private vapidPublicKey: string, private swPath: string = '/sw.js') {
    // Initialize VAPID key conversion once
    this.vapidKeyArray = this.urlBase64ToUint8Array(vapidPublicKey);
  }

  // Check if push notifications are supported
  public isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Initialize the service: checks requirements, registers SW, and requests permission
  public async initialize(): Promise<{
    success: boolean;
    registration?: ServiceWorkerRegistration;
    subscription?: PushSubscription;
    error?: string;
  }> {
    if (!this.isSupported()) {
      return { success: false, error: 'Push notifications not supported in this browser' };
    }
    
    try {
      // Get permission if not already granted
      if (!this.permissionStatus || this.permissionStatus !== 'granted') {
        this.permissionStatus = await Notification.requestPermission();
        if (this.permissionStatus !== 'granted') {
          return { success: false, error: 'Notification permission denied' };
        }
      }
      
      // Register service worker if not already registered
      if (!this.serviceWorkerRegistration) {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register(this.swPath);
      }
      
      // Get subscription if not already subscribed
      if (!this.subscription) {
        this.subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.vapidKeyArray,
        });
      }
      
      return { 
        success: true, 
        registration: this.serviceWorkerRegistration,
        subscription: this.subscription 
      };
    } catch (error) {
      console.error('Push notification initialization failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send push notification
  public async sendNotification(payload: PushNotificationPayload): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Ensure everything is initialized
      const initResult = await this.initialize();
      if (!initResult.success) {
        return { success: false, error: initResult.error };
      }
      
      // Send subscription to server
      const response = await fetch('/api/push-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          subscription: this.subscription, 
          payload 
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `Server error: ${response.status} - ${errorText}` };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Push notification sending failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Utility function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
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
  
  // Get current subscription if one exists
  public getSubscription(): PushSubscription | null {
    return this.subscription;
  }
  
  // Reset the service (useful for testing or when user revokes permission)
  public async reset(): Promise<void> {
    if (this.subscription) {
      await this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.permissionStatus = null;
  }
}

// Create a singleton instance for easy import
export const pushService = new PushNotificationService(
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
);

// Backward compatibility helpers
export const isPushNotificationSupported = () => pushService.isSupported();
export const requestNotificationPermission = async () => {
  const result = await pushService.initialize();
  return result.success;
};
export const sendPushNotification = (payload: PushNotificationPayload) => 
  pushService.sendNotification(payload);