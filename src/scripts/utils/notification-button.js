import NotificationHelper from './notification-helper';
import ApiService from '../data/api-service';

const NotificationButton = {
  async init({ container }) {
    this._container = container;

    if (!this._container) {
      console.error('Notification button container not found');
      return;
    }

    await this._renderButton();
    this._setupEventListener();
  },

  async _renderButton() {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      this._container.innerHTML = `
        <button class="notification-button" disabled>
          <i class="fa-solid fa-bell-slash"></i> Notifications Not Supported
        </button>
      `;
      return;
    }

    // Check if already subscribed
    const isSubscribed = await this._checkSubscriptionStatus();
    
    this._container.innerHTML = `
      <button id="notificationToggleBtn" class="notification-button ${isSubscribed ? 'subscribed' : ''}">
        <i class="fa-solid ${isSubscribed ? 'fa-bell-slash' : 'fa-bell'}"></i>
        ${isSubscribed ? 'Unsubscribe from Notifications' : 'Subscribe to Notifications'}
      </button>
    `;
  },

  async _checkSubscriptionStatus() {
    try {
      if (!('serviceWorker' in navigator)) return false;
      
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;
      
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Error checking notification subscription status:', error);
      return false;
    }
  },

  _setupEventListener() {
    const button = document.getElementById('notificationToggleBtn');
    if (!button) return;

    button.addEventListener('click', async () => {
      try {
        // First check if user is authenticated
        if (!ApiService.isAuthenticated()) {
          alert('You need to login first to enable notifications');
          window.location.hash = '#/login';
          return;
        }

        button.disabled = true;
        const isCurrentlySubscribed = button.classList.contains('subscribed');

        if (isCurrentlySubscribed) {
          // Unsubscribe
          await NotificationHelper.unsubscribeFromPushNotification();
          button.classList.remove('subscribed');
          button.innerHTML = '<i class="fa-solid fa-bell"></i> Subscribe to Notifications';
        } else {
          // Subscribe
          const result = await NotificationHelper.subscribeToPushNotification();
          
          if (result) {
            button.classList.add('subscribed');
            button.innerHTML = '<i class="fa-solid fa-bell-slash"></i> Unsubscribe from Notifications';
          } else {
            alert('Failed to subscribe to notifications. Please check permissions and try again.');
          }
        }
      } catch (error) {
        console.error('Error toggling notification subscription:', error);
        alert('Error toggling notification subscription. Please try again.');
      } finally {
        button.disabled = false;
      }
    });
  }
};

export default NotificationButton;
