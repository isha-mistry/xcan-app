'use client';

import { useEffect } from 'react';
import { pushService } from '@/services/pushNotificationService';

export function PushNotificationProvider() {
  useEffect(() => {
    // Initialize push notifications
    const initializePushNotifications = async () => {
      try {
        const result = await pushService.initialize();
        if (!result.success) {
          console.warn(`Push notification initialization failed: ${result.error}`);
        } else {
          console.debug('Push notifications initialized successfully');
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    initializePushNotifications();
  }, []);

  return null;
}