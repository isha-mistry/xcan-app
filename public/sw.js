self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: data
    })
  );
});

// Optional: Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Example: Open a specific page or handle the notification
  event.waitUntil(
    clients.openWindow('/notifications?active=all')
  );
});