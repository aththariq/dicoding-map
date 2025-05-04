import UserModel from "../../models/UserModel";
import RegisterPresenter from "../../presenters/RegisterPresenter";

class RegisterPage {
  constructor() {
    this._userModel = new UserModel();
    this._presenter = new RegisterPresenter({
      view: this,
      userModel: this._userModel,
    });
  }

  async render() {
    return `
      <section class="auth-container">
        <h2 class="auth-title"><i class="fa-solid fa-user-plus"></i> Register</h2>
        
        <div class="card auth-card">
          <form id="registerForm">
            <div class="form-group">
              <label for="name">Full Name</label>
              <div class="input-group">
                <i class="fa-solid fa-user input-icon"></i>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  required
                  minlength="3"
                />
              </div>
            </div>
            
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
                  minlength="8"
                />
              </div>
              <small class="form-text">Password must be at least 8 characters long</small>
            </div>
            
            <div class="form-alert" id="registerAlert"></div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-block">
                <i class="fa-solid fa-user-plus"></i> Register
              </button>
            </div>
            
            <div class="auth-links">
              <p>Already have an account? <a href="#/login">Login here</a></p>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    if (this._userModel.isAuthenticated()) {
      this.redirectAfterRegister();
      return;
    }

    const registerForm = document.getElementById("registerForm");
    const registerAlert = document.getElementById("registerAlert");

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Clear previous alerts
      registerAlert.textContent = "";
      registerAlert.classList.remove("alert-success", "alert-danger");

      // Show loading state
      const submitButton = registerForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Registering...`;
      submitButton.disabled = true;

      try {
        const formData = new FormData(registerForm);
        const userData = {
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        };

        // Validate password length
        if (userData.password.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }

        await this.onRegister(userData);
      } catch (error) {
        console.error("Registration error:", error);
        this.showRegisterError(
          error.message || "Registration failed. Please try again."
        );
      }
    });
  }

  showRegisterError(message) {
    const registerAlert = document.getElementById("registerAlert");
    const submitButton = document.querySelector(
      '#registerForm button[type="submit"]'
    );

    registerAlert.textContent = message;
    registerAlert.classList.add("alert-danger");

    // Reset button
    submitButton.innerHTML = `<i class="fa-solid fa-user-plus"></i> Register`;
    submitButton.disabled = false;
  }

  redirectAfterRegister() {
    const registerAlert = document.getElementById("registerAlert");
    if (registerAlert) {
      registerAlert.textContent = "Registration successful! Please login.";
      registerAlert.classList.add("alert-success");
    }

    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.hash = "#/login";
    }, 2000);
  }
}

export default RegisterPage;
