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

    // Capture the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent default browser install prompt
      e.preventDefault();

      // Store the event for later use
      this.deferredPrompt = e;

      // Show our custom install UI
      this.showInstallPromotion();
    });

    // Hide install banner when app is installed
    window.addEventListener("appinstalled", () => {
      console.log("App was installed");
      this.hideInstallPromotion();
    });
  },

  // Create and show a custom installation banner
  showInstallPromotion() {
    if (!this.installContainer) return;

    // Clear any existing content
    this.installContainer.innerHTML = "";

    // Create the install banner with app info
    const installBanner = document.createElement("div");
    installBanner.className = "install-banner";
    installBanner.innerHTML = `
      <div class="install-banner__content">
        <div class="install-banner__header">
          <img src="./src/public/web-app-manifest-192x192.png" alt="App Icon" class="install-banner__icon">
          <div class="install-banner__app-info">
            <h3>Dicoding Story</h3>
            <p>Share your stories with Dicoding community</p>
          </div>
        </div>
        
        <div class="install-banner__screenshots">
          <img src="./src/public/screenshot-1.png" alt="App Screenshot Desktop" class="install-banner__screenshot">
          <img src="./src/public/screenshot-2.png" alt="App Screenshot Mobile" class="install-banner__screenshot">
        </div>
        
        <div class="install-banner__features">
          <div class="install-banner__feature">
            <i class="fa-solid fa-wifi-slash"></i>
            <span>Works offline</span>
          </div>
          <div class="install-banner__feature">
            <i class="fa-solid fa-bolt"></i>
            <span>Fast loading</span>
          </div>
          <div class="install-banner__feature">
            <i class="fa-solid fa-bell"></i>
            <span>Get notifications</span>
          </div>
        </div>
        
        <button class="install-banner__button">
          <i class="fa-solid fa-download"></i> Install App
        </button>
        
        <button class="install-banner__close">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    `;

    // Add to container
    this.installContainer.appendChild(installBanner);
    this.installContainer.classList.add("active");

    // Setup event handlers
    this.installButton = installBanner.querySelector(".install-banner__button");
    const closeButton = installBanner.querySelector(".install-banner__close");

    this.installButton.addEventListener("click", () => {
      this.installApp();
    });

    closeButton.addEventListener("click", () => {
      this.hideInstallPromotion();

      // Store that user dismissed the prompt
      localStorage.setItem("installPromptDismissed", Date.now());
    });
  },

  // Hide the installation banner
  hideInstallPromotion() {
    if (!this.installContainer) return;
    this.installContainer.classList.remove("active");
  },

  // Trigger the installation flow
  async installApp() {
    if (!this.deferredPrompt) return;

    // Show the browser install prompt
    this.deferredPrompt.prompt();

    // Wait for user to respond
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);

    // Reset the deferred prompt
    this.deferredPrompt = null;

    // Hide our custom install UI
    this.hideInstallPromotion();
  },

  // Check if banner should be shown (not recently dismissed)
  shouldShowInstallBanner() {
    const lastDismissed = localStorage.getItem("installPromptDismissed");
    if (!lastDismissed) return true;

    // Don't show for 3 days after dismissal
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return Date.now() - parseInt(lastDismissed) > threeDays;
  },
};

export default InstallHelper;
