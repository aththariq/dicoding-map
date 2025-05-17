import ApiService from "../data/api-service";
import CONFIG from "../config";

const NotificationHelper = {
  isNotificationAvailable() {
    return "Notification" in window;
  },

  isNotificationGranted() {
    return Notification.permission === "granted";
  },

  async requestPermission() {
    if (!this.isNotificationAvailable()) {
      console.error("Notification API unsupported.");
      return false;
    }

    if (this.isNotificationGranted()) {
      return true;
    }

    const result = await Notification.requestPermission();
    if (result === "denied") {
      console.warn("Notification permission denied");
      return false;
    }
    if (result === "default") {
      console.warn("Notification permission prompt closed");
      return false;
    }
    return true;
  },

  isServiceWorkerAvailable() {
    return "serviceWorker" in navigator;
  },

  async registerServiceWorker() {
    if (!this.isServiceWorkerAvailable()) {
      console.error("Service Worker API unsupported");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service worker successfully registered", registration);
      return registration;
    } catch (error) {
      console.error("Service worker registration failed:", error);
      return null;
    }
  },

  async getRegisteredServiceWorker() {
    if (!this.isServiceWorkerAvailable()) {
      console.error("Service Worker API unsupported");
      return null;
    }

    return navigator.serviceWorker.ready;
  },

  async hasActiveSubscription() {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error("Error checking push notification status:", error);
      return false;
    }
  },

  async subscribeToPushNotification() {
    try {
      const serviceWorkerRegistration = await this.registerServiceWorker();
      if (!serviceWorkerRegistration) {
        throw new Error("Service worker registration failed");
      }

      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error("Notification permission denied");
      }

      // Check if already subscribed
      const existingSubscription =
        await serviceWorkerRegistration.pushManager.getSubscription();
      if (existingSubscription) {
        // Already subscribed, return the existing subscription
        return existingSubscription;
      }

      const subscription =
        await serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlB64ToUint8Array(
            CONFIG.WEB_PUSH.PUBLIC_KEY
          ),
        });

      const p256dh = btoa(
        String.fromCharCode.apply(
          null,
          new Uint8Array(subscription.getKey("p256dh"))
        )
      );

      const auth = btoa(
        String.fromCharCode.apply(
          null,
          new Uint8Array(subscription.getKey("auth"))
        )
      );

      await ApiService.subscribeToPushNotification({
        endpoint: subscription.endpoint,
        keys: {
          p256dh,
          auth,
        },
      });

      return subscription;
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      throw error; // Rethrow to handle in the UI
    }
  },

  async unsubscribeFromPushNotification() {
    try {
      const serviceWorkerRegistration = await this.registerServiceWorker();
      if (!serviceWorkerRegistration) return false;

      const subscription =
        await serviceWorkerRegistration.pushManager.getSubscription();
      if (!subscription) return false;

      await ApiService.unsubscribeFromPushNotification({
        endpoint: subscription.endpoint,
      });

      return await subscription.unsubscribe();
    } catch (error) {
      console.error("Error unsubscribing from notifications:", error);
      return false;
    }
  },

  // Method to show a test notification for debugging purposes
  async showTestNotification() {
    if (!this.isNotificationAvailable()) {
      console.error("Notification API unsupported.");
      return false;
    }

    if (!this.isNotificationGranted()) {
      const permission = await this.requestPermission();
      if (!permission) {
        console.warn("Notification permission not granted");
        return false;
      }
    }

    const serviceWorkerRegistration = await this.getRegisteredServiceWorker();
    if (!serviceWorkerRegistration) {
      console.error("No active service worker found");
      return false;
    }

    serviceWorkerRegistration.showNotification("Test Notification", {
      body: "This is a test notification from Dicoding Story",
      icon: "./src/public/favicon.svg",
      badge: "./src/public/web-app-manifest-192x192.png",
      vibrate: [100, 50, 100],
      data: {
        url: window.location.origin,
      },
      actions: [
        {
          action: "open",
          title: "View App",
        },
        {
          action: "close",
          title: "Dismiss",
        },
      ],
    });

    return true;
  },

  urlB64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  },
};

export default NotificationHelper;
