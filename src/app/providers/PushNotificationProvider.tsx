'use client';

import { useEffect } from 'react';
import * as pushNotificationService from '@/services/pushNotificationService';

export function PushNotificationProvider() {
  useEffect(() => {
    // Initialize push notifications
    pushNotificationService.ensureNotificationReady();
  }, []);

  return null;
}