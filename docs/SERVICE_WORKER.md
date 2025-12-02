# Service Worker & Offline Support

The Smart Home Dashboard includes a service worker for offline caching and improved performance.

## Features

### 🚀 Performance Optimization
- **Cache First** for static assets (JS, CSS, fonts, images)
- **Network First with Timeout** for Home Assistant API calls
- **Stale While Revalidate** for dynamic content
- Automatic cache updates in the background

### 📴 Offline Support
- Cached assets available offline
- Recent API responses cached for 5 minutes
- Graceful fallback when network is unavailable
- Offline indicator shown when connection is lost

### 🔄 Auto-Updates
- Automatic version checking every hour
- Update prompt when new version is available
- One-click update with page reload
- Seamless background updates

## Caching Strategy

### Static Assets (7 days)
- JavaScript bundles
- CSS stylesheets
- Fonts (WOFF2, TTF)
- Static images

### API Responses (5 minutes)
- Home Assistant states
- Sensor data
- Media player information
- Network First with 3-second timeout

### Dynamic Content (24 hours)
- Album artwork
- Entity pictures
- Background images

## Cache Management

### Automatic Cleanup
Old caches are automatically removed when new versions are activated.

### Manual Cache Clear
```typescript
import { clearAllCaches } from '@/lib/serviceWorker';

// Clear all caches
await clearAllCaches();
```

### Unregister Service Worker
```typescript
import { unregisterServiceWorker } from '@/lib/serviceWorker';

// Remove service worker
await unregisterServiceWorker();
```

## Browser Support

Service Worker is supported in all modern browsers:
- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+

For unsupported browsers, the app works normally without offline support.

## Development

### Local Testing
Service workers only work over HTTPS or localhost. During local development on `localhost:8080`, the service worker is fully functional.

### Production
The service worker is automatically registered in production builds and provides:
- Faster load times on repeat visits
- Offline access to recently viewed content
- Automatic updates with user notification

## Configuration

Service worker settings can be found in `/public/sw.js`:

```javascript
const CACHE_VERSION = 'v1.0.0';
const CACHE_LIMITS = {
  static: 7 * 24 * 60 * 60 * 1000,  // 7 days
  api: 5 * 60 * 1000,                // 5 minutes
  dynamic: 24 * 60 * 60 * 1000,      // 24 hours
};
```

## PWA Features

The app includes a Web App Manifest (`/public/manifest.json`) that enables:
- Add to Home Screen on mobile devices
- Standalone app mode
- Custom splash screen
- Theme color customization

## Network Resilience

### Timeout Handling
API requests timeout after 3 seconds and fall back to cached data if available.

### Offline Detection
The app automatically detects network status changes and shows an offline indicator when disconnected.

### Background Sync
When the network is restored, the service worker automatically updates cached data in the background.

## Best Practices

1. **Keep Caches Small**: Old caches are automatically cleaned up
2. **Update Regularly**: Users are prompted to update when new versions are available
3. **Graceful Degradation**: App works normally even without service worker support
4. **Security**: Service workers only work over HTTPS (except localhost)

## Troubleshooting

### Clear Service Worker Cache
1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Click "Unregister" and reload the page

### Force Update
1. Open DevTools (F12)
2. Check "Update on reload" in Application → Service Workers
3. Reload the page

### Inspect Cache Contents
1. Open DevTools (F12)
2. Go to Application → Cache Storage
3. Expand cache names to view cached files
