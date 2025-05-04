class LoginPresenter {
  constructor({ view, userModel }) {
    this._view = view;
    this._userModel = userModel;

    this._initBindEvents();
  }

  _initBindEvents() {
    this._view.onLogin = this._login.bind(this);
  }

  async _login(credentials) {
    try {
      const result = await this._userModel.login(credentials);
      if (result.error) {
        this._view.showLoginError(result.message);
        return;
      }

      this._view.redirectAfterLogin();
    } catch (error) {
      this._view.showLoginError("Login failed. Please try again.");
    }
  }
}

export default LoginPresenter;
