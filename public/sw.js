// Log when the service worker is loaded
console.log('Service Worker Loaded');

// Handle installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting(); // Ensures the service worker activates right away
});

// Handle activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  // Take control of all clients as soon as it activates
  event.waitUntil(self.clients.claim());
});

// Handle push events
self.addEventListener('push', (event) => {
  console.log('Push received:', event);
  
  let data;
  try {
    data = event.data?.json() || {};
    console.log('Notification data:', data);
  } catch (e) {
    console.error('Error parsing notification data:', e);
    data = {
      title: 'New Notification',
      body: 'Something new happened'
    };
  }
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100], // Add vibration pattern for mobile
    data: data.data || data,
    tag: data.tag || 'default-tag', // Tag to group notifications
    actions: data.actions || []
  };
  
  console.log('Showing notification with options:', options);
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
    .then(() => console.log('Notification shown successfully'))
    .catch(err => console.error('Error showing notification:', err))
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();
  
  const urlToOpen = '/notifications?active=all';
  
  // Example: Open a specific page or handle the notification
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window/tab is open, open a new one
      return clients.openWindow(urlToOpen);
    })
  );
});
