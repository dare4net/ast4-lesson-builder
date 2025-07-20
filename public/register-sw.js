function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Check if the app can be installed
        if ('getInstalledRelatedApps' in navigator) {
          try {
            const relatedApps = await navigator.getInstalledRelatedApps();
            console.log('Related apps:', relatedApps);
          } catch (e) {
            console.log('Could not check for installed apps:', e);
          }
        }
      } catch (error) {
        console.error('ServiceWorker registration failed: ', error);
      }
    });
  } else {
    console.log('Service workers are not supported');
  }
}

registerServiceWorker();
