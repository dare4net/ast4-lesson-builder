// Global self-healing emergency reset utility for PWA
window.__emergencyPWAReset = async function () {
  console.warn('[PWA] Executing emergency storage & SW reset...');
  try {
    // 1. Clear localStorage & sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // 2. Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
    }

    // 3. Clear cache storage
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
    }

    console.log('[PWA] Reset complete. Reloading page...');
  } catch (err) {
    console.error('[PWA] Reset error:', err);
  } finally {
    window.location.reload();
  }
};

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Listen for controllerchange to reload page when new service worker activates
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('ServiceWorker registration successful with scope: ', registration.scope);

        // Auto update check
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New SW version available. Auto-activating...');
                newWorker.postMessage({ action: 'skipWaiting' });
              }
            });
          }
        });

        // Check for installed related apps
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
