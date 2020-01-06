//https://stackoverflow.com/questions/31512504/html5-notification-not-working-in-mobile-chrome

navigator.serviceWorker.register('sw.js');
Notification.requestPermission(function(result) {
  if (result === 'granted') {
    navigator.serviceWorker.ready.then(function(registration) {
      console.log("notif")
      registration.showNotification('Notification with ServiceWorker');
    });
  }
});
