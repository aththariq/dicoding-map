class RegisterPresenter {
  constructor({ view, userModel }) {
    this._view = view;
    this._userModel = userModel;

    this._initBindEvents();
  }

  _initBindEvents() {
    this._view.onRegister = this._register.bind(this);
  }

  async _register(userData) {
    try {
      const result = await this._userModel.register(userData);
      if (result.error) {
        this._view.showRegisterError(result.message);
        return;
      }

      this._view.redirectAfterRegister();
    } catch (error) {
      this._view.showRegisterError("Registration failed. Please try again.");
    }
  }
}

export default RegisterPresenter;
