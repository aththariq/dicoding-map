import API from "./api";
import CONFIG from "../config";

class ApiService {
  static async register({ name, email, password }) {
    const response = await fetch(API.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    return await response.json();
  }

  static async login({ email, password }) {
    const response = await fetch(API.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const responseJson = await response.json();

    if (!responseJson.error) {
      const { token, name, userId } = responseJson.loginResult;
      localStorage.setItem(CONFIG.TOKEN_KEY, token);
      localStorage.setItem(
        CONFIG.USER_INFO_KEY,
        JSON.stringify({ name, userId })
      );
    }

    return responseJson;
  }

  static async logout() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_INFO_KEY);
  }

  static async getAllStories({ page, size, withLocation } = {}) {
    let url = API.STORIES;
    const params = new URLSearchParams();

    if (page) params.append("page", page);
    if (size) params.append("size", size);
    if (withLocation) params.append("location", 1);

    const queryParams = params.toString();
    if (queryParams) {
      url = `${url}?${queryParams}`;
    }

    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.json();
  }

  static async getStoryDetail(id) {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const response = await fetch(`${API.STORIES}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.json();
  }

  static async addStory({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);

    if (lat && lon) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const url = token ? API.STORIES : API.GUEST_STORY;

    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    return await response.json();
  }

  static async subscribeToPushNotification(subscription) {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const response = await fetch(API.NOTIFICATION_SUBSCRIBE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });

    return await response.json();
  }

  static async unsubscribeFromPushNotification(endpoint) {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const response = await fetch(API.NOTIFICATION_SUBSCRIBE, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });

    return await response.json();
  }

  static isAuthenticated() {
    return !!localStorage.getItem(CONFIG.TOKEN_KEY);
  }

  static getUserInfo() {
    const userInfoString = localStorage.getItem(CONFIG.USER_INFO_KEY);
    return userInfoString ? JSON.parse(userInfoString) : null;
  }
}

export default ApiService;
