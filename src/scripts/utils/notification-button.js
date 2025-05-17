import NotificationHelper from "./notification-helper";
import ApiService from "../data/api-service";

const NotificationButton = {
  async init({ container }) {
    this._container = container;

    if (!this._container) {
      console.error("Notification button container not found");
      return;
    }

    await this._renderButton();
    this._setupEventListener();
  },

  async _renderButton() {
    // Check if browser supports notifications
    if (!NotificationHelper.isNotificationAvailable()) {
      this._container.innerHTML = `
        <button class="notification-button notification-button--prominent" disabled>
          <i class="fa-solid fa-bell-slash"></i> <span>Notifications Not Supported</span>
        </button>
      `;
      return;
    }

    // Check if service worker is available
    if (!NotificationHelper.isServiceWorkerAvailable()) {
      this._container.innerHTML = `
        <button class="notification-button notification-button--prominent" disabled>
          <i class="fa-solid fa-bell-slash"></i> <span>Service Workers Not Supported</span>
        </button>
      `;
      return;
    }

    // Check if already subscribed
    const isSubscribed = await NotificationHelper.hasActiveSubscription();

    this._container.innerHTML = `
      <button id="notificationToggleBtn" class="notification-button notification-button--prominent ${
        isSubscribed ? "subscribed" : ""
      }">
        <i class="fa-solid ${isSubscribed ? "fa-bell-slash" : "fa-bell"}"></i>
        <span>${
          isSubscribed
            ? "Unsubscribe from Notifications"
            : "Subscribe to Notifications"
        }</span>
      </button>
    `;
  },

  _setupEventListener() {
    const button = document.getElementById("notificationToggleBtn");
    if (!button) return;

    button.addEventListener("click", async () => {
      try {
        // First check if user is authenticated
        if (!ApiService.isAuthenticated()) {
          alert("You need to login first to enable notifications");
          window.location.hash = "#/login";
          return;
        }

        button.disabled = true;
        button.classList.add("loading");
        const isCurrentlySubscribed = button.classList.contains("subscribed");

        if (isCurrentlySubscribed) {
          // Unsubscribe
          const success =
            await NotificationHelper.unsubscribeFromPushNotification();
          if (success) {
            button.classList.remove("subscribed");
            button.innerHTML =
              '<i class="fa-solid fa-bell"></i> <span>Subscribe to Notifications</span>';
            this._showNotification(
              "Unsubscribed successfully",
              "You will no longer receive notifications"
            );
          } else {
            this._showNotification(
              "Failed to unsubscribe",
              "Please try again later",
              true
            );
          }
        } else {
          // Subscribe
          try {
            const subscription =
              await NotificationHelper.subscribeToPushNotification();

            if (subscription) {
              button.classList.add("subscribed");
              button.innerHTML =
                '<i class="fa-solid fa-bell-slash"></i> <span>Unsubscribe from Notifications</span>';

              // Show test notification to demonstrate it's working
              setTimeout(() => {
                NotificationHelper.showTestNotification();
              }, 1000);

              this._showNotification(
                "Subscribed successfully",
                "You will now receive notifications for new stories"
              );
            } else {
              this._showNotification(
                "Failed to subscribe",
                "Please check permissions and try again",
                true
              );
            }
          } catch (error) {
            console.error("Subscription error:", error);
            if (error.message === "Notification permission denied") {
              this._showNotification(
                "Permission Denied",
                "Please allow notifications in your browser settings",
                true
              );
            } else {
              this._showNotification(
                "Subscription Failed",
                error.message || "Please try again later",
                true
              );
            }
          }
        }
      } catch (error) {
        console.error("Error toggling notification subscription:", error);
        this._showNotification(
          "Error",
          "Failed to toggle notification subscription. Please try again.",
          true
        );
      } finally {
        button.disabled = false;
        button.classList.remove("loading");
      }
    });
  },

  _showNotification(title, message, isError = false) {
    if (
      NotificationHelper.isNotificationAvailable() &&
      NotificationHelper.isNotificationGranted()
    ) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body: message,
          icon: "./src/public/favicon.svg",
          badge: "./src/public/web-app-manifest-192x192.png",
          vibrate: [100, 50, 100],
        });
      });
    } else {
      // Fallback to alert or custom toast notification
      console.log(`${title}: ${message}`);
      // If you have a toast component, use it here
      const event = new CustomEvent("toast", {
        detail: {
          message: `${title}: ${message}`,
          type: isError ? "error" : "success",
        },
      });
      document.dispatchEvent(event);
    }
  },
};

export default NotificationButton;
