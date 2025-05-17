const ToastInitiator = {
  init() {
    this._createToastContainer();
    this._setupEventListener();
  },

  _createToastContainer() {
    if (document.getElementById("toast-container")) return;

    const toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    document.body.appendChild(toastContainer);
  },

  _setupEventListener() {
    document.addEventListener("toast", (event) => {
      const { message, type = "info", duration = 3000 } = event.detail;
      this._showToast(message, type, duration);
    });
  },

  _showToast(message, type = "info", duration = 3000) {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.classList.add("toast--visible");
    }, 10);

    // Remove after duration
    setTimeout(() => {
      toast.classList.remove("toast--visible");

      // Remove from DOM after animation completes
      setTimeout(() => {
        if (toast.parentNode === toastContainer) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }, duration);
  },
};

export default ToastInitiator;
