import ApiService from "../data/api-service";
import CONFIG from "../config";

const NotificationHelper = {
  async requestPermission() {
    if ("Notification" in window) {
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
    }
    return false;
  },

  async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        return registration;
      } catch (error) {
        console.error("Service worker registration failed:", error);
        return null;
      }
    }
    return null;
  },

  async subscribeToPushNotification() {
    try {
      const serviceWorkerRegistration = await this.registerServiceWorker();
      if (!serviceWorkerRegistration) return;

      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      const subscription =
        await serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlB64ToUint8Array(
            CONFIG.WEB_PUSH.PUBLIC_KEY
          ),
        });

      await ApiService.subscribeToPushNotification({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(subscription.getKey("p256dh"))
            )
          ),
          auth: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(subscription.getKey("auth"))
            )
          ),
        },
      });

      return subscription;
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      return null;
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
