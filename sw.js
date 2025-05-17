// Service Worker with Workbox
try {
  importScripts(
    "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
  );

  // Workbox configuration
  workbox.setConfig({
    debug: false,
  });

  const { strategies, routing, precaching, expiration, cacheableResponse } =
    workbox;

  // Cache name
  const CACHE_NAME = "dicoding-story-v4";

  // Precached assets - critical for App Shell
  const appShellFiles = [
    "/",
    "/index.html",
    "/manifest.json",
    "./src/scripts/app.js",
    "./src/scripts/index.js",
    "./src/styles/main.css",
    "./src/styles/styles.css",
    "./src/styles/notification.css",
    "./src/styles/toast.css",
    "./src/styles/data-manager.css",
    "./src/public/favicon.svg",
    "./src/public/favicon.ico",
    "./src/public/favicon-96x96.png",
    "./src/public/apple-touch-icon.png",
    "./src/public/web-app-manifest-192x192.png",
    "./src/public/web-app-manifest-512x512.png",
    "./src/public/screenshot-1.jpg",
    "./src/public/screenshot-2.jpg",
    "./src/public/site.webmanifest",
    "./src/public/images/logo.svg",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
    "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
  ];

  // Configure precaching
  precaching.precacheAndRoute([
    ...appShellFiles.map((url) => ({
      url,
      revision: CACHE_NAME,
    })),
  ]);

  // Cache CSS, JS, and Web Worker files with a Stale While Revalidate strategy
  routing.registerRoute(
    ({ request }) =>
      request.destination === "style" ||
      request.destination === "script" ||
      request.destination === "worker",
    new strategies.StaleWhileRevalidate({
      cacheName: "assets-cache",
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // Cache image files with a Cache First strategy
  routing.registerRoute(
    ({ request }) => request.destination === "image",
    new strategies.CacheFirst({
      cacheName: "images-cache",
      plugins: [
        new expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // Cache Google Fonts with a Stale While Revalidate strategy
  routing.registerRoute(
    ({ url }) =>
      url.origin === "https://fonts.googleapis.com" ||
      url.origin === "https://fonts.gstatic.com",
    new strategies.StaleWhileRevalidate({
      cacheName: "google-fonts",
      plugins: [
        new expiration.ExpirationPlugin({
          maxEntries: 30,
        }),
      ],
    })
  );

  // Cache Leaflet map tiles with a Cache First strategy
  routing.registerRoute(
    ({ url }) =>
      url.origin === "https://unpkg.com" ||
      url.href.includes("tile.openstreetmap.org") ||
      url.href.includes("server.arcgisonline.com") ||
      url.href.includes("tile.opentopomap.org"),
    new strategies.CacheFirst({
      cacheName: "map-cache",
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  );

  // Network First strategy for API calls - attempt network first, fall back to cache
  routing.registerRoute(
    ({ url }) => url.href.includes("story-api.dicoding.dev"),
    new strategies.NetworkFirst({
      cacheName: "api-cache",
      plugins: [
        new expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        }),
      ],
      networkTimeoutSeconds: 3, // Fallback to cache after 3 seconds if network is slow
    })
  );

  // Cache JSON files for configs and manifests
  routing.registerRoute(
    ({ request }) =>
      request.destination === "manifest" || request.url.includes(".json"),
    new strategies.StaleWhileRevalidate({
      cacheName: "json-cache",
      plugins: [
        new cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  );

  // Cache pages for offline access using Network First
  routing.registerRoute(
    ({ request }) => request.mode === "navigate",
    new strategies.NetworkFirst({
      cacheName: "pages-cache",
      plugins: [
        new expiration.ExpirationPlugin({
          maxEntries: 50,
        }),
      ],
    })
  );

  // Offline fallback - if a navigation request fails, show the offline page
  routing.setCatchHandler(({ event }) => {
    if (event.request.destination === "document") {
      return caches.match("/index.html");
    }
    return Response.error();
  });

  // Handle push notifications
  self.addEventListener("push", (event) => {
    let notificationData = {};

    try {
      notificationData = event.data.json();
    } catch (e) {
      // Fallback for non-JSON data
      const text = event.data ? event.data.text() : "No payload";
      notificationData = {
        title: "Dicoding Story",
        options: {
          body: text || "New update available",
          icon: "./src/public/favicon.svg",
          badge: "./src/public/web-app-manifest-192x192.png",
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            url: self.location.origin,
          },
          actions: [
            {
              action: "open",
              title: "View",
            },
            {
              action: "close",
              title: "Dismiss",
            },
          ],
        },
      };
    }

    const { title, options } = notificationData;

    event.waitUntil(
      self.registration
        .showNotification(title, options)
        .then(() => self.registration.getNotifications())
        .then((notifications) => {
          // Optional: manage notifications, e.g., close old ones
          console.log("Active notifications:", notifications.length);
        })
    );
  });

  // Handle notification click
  self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    // Get the action and URL
    const action = event.action;
    const urlToOpen = event.notification.data?.url || "/";

    // If the action is close, just close the notification
    if (action === "close") {
      return;
    }

    // For other actions (default action or 'open' action)
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // If a window client is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }

        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }

        return null;
      })
    );
  });

  // Skip waiting to make updates active immediately
  self.addEventListener("install", (event) => {
    self.skipWaiting();
  });

  // Claim clients to update already open pages
  self.addEventListener("activate", (event) => {
    event.waitUntil(clients.claim());
  });
} catch (error) {
  console.error("Error in service worker:", error);
}
