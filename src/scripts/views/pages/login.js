import UserModel from "../../models/UserModel";
import LoginPresenter from "../../presenters/LoginPresenter";

class LoginPage {
  constructor() {
    this._userModel = new UserModel();
    this._presenter = new LoginPresenter({
      view: this,
      userModel: this._userModel,
    });
  }

  async render() {
    return `
      <section class="auth-container">
        <h2 class="auth-title"><i class="fa-solid fa-sign-in-alt"></i> Login</h2>
        
        <div class="card auth-card">
          <form id="loginForm">
            <div class="form-group">
              <label for="email">Email</label>
              <div class="input-group">
                <i class="fa-solid fa-envelope input-icon"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-group">
                <i class="fa-solid fa-lock input-icon"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            
            <div class="form-alert" id="loginAlert"></div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-block">
                <i class="fa-solid fa-sign-in-alt"></i> Login
              </button>
            </div>
            
            <div class="auth-links">
              <p>Don't have an account? <a href="#/register">Register here</a></p>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    if (this._userModel.isAuthenticated()) {
      this.redirectAfterLogin();
      return;
    }

    const loginForm = document.getElementById("loginForm");
    const loginAlert = document.getElementById("loginAlert");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Clear previous alerts
      loginAlert.textContent = "";
      loginAlert.classList.remove("alert-success", "alert-danger");

      // Show loading state
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Logging in...`;
      submitButton.disabled = true;

      try {
        const formData = new FormData(loginForm);
        const credentials = {
          email: formData.get("email"),
          password: formData.get("password"),
        };

        await this.onLogin(credentials);
      } catch (error) {
        console.error("Login error:", error);
        this.showLoginError(error.message || "Login failed. Please try again.");
      }
    });
  }

  showLoginError(message) {
    const loginAlert = document.getElementById("loginAlert");
    const submitButton = document.querySelector(
      '#loginForm button[type="submit"]'
    );

    loginAlert.textContent = message;
    loginAlert.classList.add("alert-danger");

    // Reset button
    submitButton.innerHTML = `<i class="fa-solid fa-sign-in-alt"></i> Login`;
    submitButton.disabled = false;
  }

  redirectAfterLogin() {
    const loginAlert = document.getElementById("loginAlert");
    if (loginAlert) {
      loginAlert.textContent = "Login successful! Redirecting...";
      loginAlert.classList.add("alert-success");
    }

    // Redirect to home page after a short delay
    setTimeout(() => {
      window.location.hash = "#/home";
    }, 1000);
  }
}

export default LoginPage;
