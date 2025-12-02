/**
 * Service Worker Registration and Management
 */

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * Register service worker for offline caching
 */
export async function registerServiceWorker(config: ServiceWorkerConfig = {}): Promise<void> {
  // Only register in production and if supported
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Service Worker registered:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          console.log('[SW] New version available');
          config.onUpdate?.(registration);
        }
      });
    });

    // Success callback
    if (registration.active) {
      config.onSuccess?.(registration);
    }

    // Check for updates every hour
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

  } catch (error) {
    console.error('[SW] Registration failed:', error);
    config.onError?.(error as Error);
  }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    await Promise.all(
      registrations.map((registration) => registration.unregister())
    );
    
    console.log('[SW] All service workers unregistered');
  } catch (error) {
    console.error('[SW] Unregistration failed:', error);
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((name) => caches.delete(name))
    );
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Cache clearing failed:', error);
  }
}

/**
 * Send message to service worker
 */
export function sendMessageToSW(message: any): void {
  if (!navigator.serviceWorker.controller) {
    return;
  }

  navigator.serviceWorker.controller.postMessage(message);
}

/**
 * Skip waiting and activate new service worker immediately
 */
export function skipWaitingAndReload(): void {
  sendMessageToSW({ type: 'SKIP_WAITING' });
  
  // Reload page after service worker activates
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}
