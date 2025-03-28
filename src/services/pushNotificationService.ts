export class PushNotificationService {
  private static instance: PushNotificationService;

  private constructor() {}

  public static getInstance(): PushNotificationService {
    if (!this.instance) {
      this.instance = new PushNotificationService();
    }
    return this.instance;
  }

  // Type-safe method to check notification support
  public isNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  // Type-safe method to get current permission status
  public getNotificationPermission(): NotificationPermission {
    if (!this.isNotificationSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Comprehensive method to request permission
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    // Check if notifications are supported
    if (!this.isNotificationSupported()) {
      console.warn('Notifications are not supported in this browser');
      return 'denied';
    }

    // Request permission
    const permission = await Notification.requestPermission();

    // Handle different permission states
    switch (permission) {
      case 'granted':
        console.log('Notification permission granted');
        break;
      case 'denied':
        console.warn('Notification permission denied');
        break;
      case 'default':
        console.log('Notification permission not yet chosen');
        break;
    }

    return permission;
  }

  // Method to send push notification with permission check
  public async sendPushNotification(notification: {
    title: string;
    body: string;
    icon?: string;
    data?: any;
  }): Promise<boolean> {
    // Comprehensive permission check
    const currentPermission = this.getNotificationPermission();

    // Handle different permission scenarios
    switch (currentPermission) {
      case 'granted':
        try {
          // Ensure service worker is ready
          const registration = await navigator.serviceWorker.ready;
          
          registration.showNotification(notification.title, {
            body: notification.body,
            icon: notification.icon || '/icon.png',
            badge: '/icon.png',
            data: notification.data
          });

          return true;
        } catch (error) {
          console.error('Error showing push notification:', error);
          return false;
        }
      
      case 'denied':
        console.warn('Notifications are blocked');
        return false;
      
      case 'default':
        // Attempt to request permission
        const newPermission = await this.requestNotificationPermission();
        
        if (newPermission === 'granted') {
          return this.sendPushNotification(notification);
        }
        
        return false;
    }
  }

  // Enhanced method to ensure notification readiness
  public async ensureNotificationReady(): Promise<boolean> {
    if (!this.isNotificationSupported()) {
      console.warn('Notifications not supported');
      return false;
    }

    const currentPermission = this.getNotificationPermission();

    if (currentPermission === 'granted') {
      return true;
    }

    if (currentPermission === 'default') {
      const newPermission = await this.requestNotificationPermission();
      return newPermission === 'granted';
    }

    return false;
  }
}