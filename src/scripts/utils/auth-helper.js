import ApiService from "../data/api-service";

const AuthHelper = {
  checkAuthentication() {
    const isAuthenticated = ApiService.isAuthenticated();

    // Update navigation items based on authentication status
    const loginMenuItem = document.getElementById("loginMenuItem");
    const registerMenuItem = document.getElementById("registerMenuItem");
    const logoutMenuItem = document.getElementById("logoutMenuItem");

    if (isAuthenticated) {
      loginMenuItem.classList.add("hidden");
      registerMenuItem.classList.add("hidden");
      logoutMenuItem.classList.remove("hidden");
    } else {
      loginMenuItem.classList.remove("hidden");
      registerMenuItem.classList.remove("hidden");
      logoutMenuItem.classList.add("hidden");
    }

    // Setup logout button event
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", async (event) => {
        event.preventDefault();
        await ApiService.logout();
        this.checkAuthentication();
        window.location.hash = "#/home";
      });
    }

    return isAuthenticated;
  },

  redirectIfNotAuthenticated() {
    if (!this.checkAuthentication()) {
      window.location.hash = "#/login";
      return true;
    }
    return false;
  },

  redirectIfAuthenticated() {
    if (this.checkAuthentication()) {
      window.location.hash = "#/home";
      return true;
    }
    return false;
  },
};

export default AuthHelper;
