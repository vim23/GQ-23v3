import {
  cleanupOutdatedCaches,
  // createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
// import { warmStrategyCache } from 'workbox-recipes';
import { StaleWhileRevalidate, NetworkOnly, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin, Queue } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// clean old assets
cleanupOutdatedCaches();

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// Set up page cache that so that the page is served from the cache if the user is offline. The cache must store all the pages that are navigated to by the user. The cache will be updated if the page is changed on the server. The cache will be deleted after 30 days.
const maxAgeSeconds = 30 * 24 * 60 * 60;
const maxEntries = 60;
const pageCache = new StaleWhileRevalidate({
  cacheName: 'page-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds,
      maxEntries,
    }),
  ],
});

registerRoute(({ request }) => request.mode === 'navigate', pageCache);

// create a cache that stores all script files except easyButton, that are used by the page during runtime. The cache will be updated if the script file is changed on the server. The cache will be deleted after 30 days.
const scriptCache = new StaleWhileRevalidate({
  cacheName: 'script-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds,
      maxEntries,
    }),
  ],
});

registerRoute(
  ({ request }) => request.destination === 'script' && request.url.indexOf('easyButton.js') === -1,
  scriptCache
);

// Set up image cache that will be used for critical css images except easyButton css, in the page during runtime and for images that are added to the page after the service worker is installed. The images will be cached for 30 days. but will be updated if the image is changed on the server. Do not cache OpenStreetMap tiles.
const imageCache = new CacheFirst({
  cacheName: 'image-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds,
      maxEntries,
    }),
  ],
});

registerRoute(
  ({ request }) =>
    request.destination === 'image' &&
    request.url.indexOf('easyButton.css') === -1 &&
    request.url.indexOf('tile.openstreetmap.org') === -1,
  imageCache
);

// Google Fonts cache
const sheetCacheName = 'google-fonts-stylesheets';

registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: sheetCacheName,
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
const fontCacheName = 'google-fonts-webfonts';
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: fontCacheName,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);

// Set up background sync for POST requests to the server that are made when the user is offline. The requests will be retried when the user is online again.
const bgSyncPlugin = new BackgroundSyncPlugin('postQueue', {
  maxRetentionTime: 24 * 60, // Retry for max of 24 Hours (specified in minutes)
});

const networkWithBackgroundSync = new NetworkOnly({
  plugins: [bgSyncPlugin],
});

registerRoute(({ request }) => request.method === 'POST', networkWithBackgroundSync, 'POST');
