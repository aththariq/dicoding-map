/*
 * Install Helper for PWA Installation Banner
 *
 * Handles the beforeinstallprompt event and provides
 * a custom install banner with screenshots, icons, and app info
 */

const InstallHelper = {
  deferredPrompt: null,
  installContainer: null,
  installButton: null,

  init({ installContainer }) {
    this.installContainer = installContainer;

    if (!installContainer) {
      console.error(
        "Install container element not found. Make sure the element exists in the DOM."
      );
      return;
    }

    console.log("InstallHelper initialized with container:", installContainer);

    // Check if the app is already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      console.log("App is already installed, not showing install prompt");
      return;
    }

    // Detect iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      // On iOS, we need to show our custom banner
      setTimeout(() => {
        if (this.shouldShowInstallBanner()) {
          this.showIOSInstallBanner();
        }
      }, 3000);
    }

    // Capture the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent default browser install prompt
      e.preventDefault();
      console.log("beforeinstallprompt event was fired and prevented");

      // Store the event for later use
      this.deferredPrompt = e;

      // Only show if user hasn't dismissed recently
      if (this.shouldShowInstallBanner()) {
        // Show our custom install UI
        this.showInstallPromotion();
      }
    });

    // Hide install banner when app is installed
    window.addEventListener("appinstalled", (event) => {
      console.log("App was installed", event);
      this.hideInstallPromotion();
      this.deferredPrompt = null;

      // Save in localStorage that the app was installed
      localStorage.setItem("appInstalled", "true");

      // Show confirmation message
      const event2 = new CustomEvent("toast", {
        detail: {
          message: "Dicoding Story was successfully installed!",
          type: "success",
        },
      });
      document.dispatchEvent(event2);
    });

    // Check query parameters for auto-display of install banner
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("install") === "true") {
      setTimeout(() => {
        if (this.deferredPrompt) {
          this.showInstallPromotion();
        } else {
          console.log("Install prompt not yet available");
        }
      }, 3000);
    } else {
      // For testing purposes - show banner after a short delay
      // This helps us confirm the UI is working correctly
      setTimeout(() => {
        if (
          !this.deferredPrompt &&
          !window.matchMedia("(display-mode: standalone)").matches &&
          !localStorage.getItem("appInstalled")
        ) {
          console.log("Showing test banner after timeout");
          this.showInstallPromotion(true);
        }
      }, 5000);
    }
  },

  // Create and show a custom installation banner
  showInstallPromotion(isTest = false) {
    if (!this.installContainer) {
      console.error("Cannot show install promotion: container is null");
      return;
    }

    console.log("Showing install promotion banner");

    // Add active class to show the banner with animation
    this.installContainer.classList.add("active");

    // Setup event handlers
    this.installButton = document.getElementById("installButton");
    const closeButton = document.getElementById("closeInstallBanner");

    if (this.installButton) {
      this.installButton.addEventListener("click", () => {
        if (isTest && !this.deferredPrompt) {
          alert(
            "This is a test banner. In a real scenario, the app installation would start now."
          );
          this.hideInstallPromotion();
          return;
        }
        this.installApp();
      });
    }

    if (closeButton) {
      closeButton.addEventListener("click", () => {
        this.hideInstallPromotion();

        // Store that user dismissed the prompt
        localStorage.setItem("installPromptDismissed", Date.now());
      });
    }
  },

  // Hide the installation banner
  hideInstallPromotion() {
    if (!this.installContainer) return;
    this.installContainer.classList.remove("active");

    // Optional: Also hide with animation
    const banner = this.installContainer.querySelector(".install-banner");
    if (banner) {
      banner.classList.add("hiding");
      setTimeout(() => {
        this.installContainer.innerHTML = "";
      }, 300);
    }
  },

  // Trigger the installation flow
  async installApp() {
    if (!this.deferredPrompt) {
      console.log("No installation prompt available");

      // Show platform-specific installation instructions
      if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
        alert(
          "To install this app on iOS: tap the share icon and then select 'Add to Home Screen'"
        );
      } else if (/android/i.test(navigator.userAgent)) {
        alert(
          "To install this app on Android, tap on the menu button (⋮) in your browser and select 'Install app' or 'Add to Home Screen'"
        );
      } else {
        alert(
          "To install this app, click the install icon in your browser's address bar or menu options"
        );
      }

      return;
    }

    // Show the browser install prompt
    this.deferredPrompt.prompt();

    // Wait for user to respond
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);

    // Reset the deferred prompt
    this.deferredPrompt = null;

    // Hide our custom install UI
    this.hideInstallPromotion();

    // Report outcome
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
      const event = new CustomEvent("toast", {
        detail: {
          message: "Installing Dicoding Story...",
          type: "info",
        },
      });
      document.dispatchEvent(event);
    } else {
      console.log("User dismissed the install prompt");
    }
  },

  // Check if banner should be shown (not recently dismissed)
  shouldShowInstallBanner() {
    const lastDismissed = localStorage.getItem("installPromptDismissed");
    if (!lastDismissed) return true;

    // Don't show for 3 days after dismissal
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return Date.now() - parseInt(lastDismissed) > threeDays;
  },

  // Method for manually triggering the banner (for debugging)
  debugShowBanner() {
    this.showInstallPromotion(true);
  },
};

export default InstallHelper;
