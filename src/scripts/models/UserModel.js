import ApiService from "../data/api-service";

class UserModel {
  constructor() {
    this._isAuthenticated = ApiService.isAuthenticated();
    this._userInfo = ApiService.getUserInfo();
  }

  async login(credentials) {
    try {
      const response = await ApiService.login(credentials);
      if (response.error) {
        throw new Error(response.message);
      }

      this._isAuthenticated = true;
      this._userInfo = ApiService.getUserInfo();

      return {
        error: false,
        message: "Login successful",
      };
    } catch (error) {
      return {
        error: true,
        message: error.message || "Failed to login",
      };
    }
  }

  async register(userData) {
    try {
      const response = await ApiService.register(userData);
      if (response.error) {
        throw new Error(response.message);
      }

      return {
        error: false,
        message: "Registration successful",
      };
    } catch (error) {
      return {
        error: true,
        message: error.message || "Failed to register",
      };
    }
  }

  async logout() {
    await ApiService.logout();
    this._isAuthenticated = false;
    this._userInfo = null;
    return {
      error: false,
      message: "Logout successful",
    };
  }

  isAuthenticated() {
    this._isAuthenticated = ApiService.isAuthenticated();
    return this._isAuthenticated;
  }

  getUserInfo() {
    this._userInfo = ApiService.getUserInfo();
    return this._userInfo;
  }
}

export default UserModel;
