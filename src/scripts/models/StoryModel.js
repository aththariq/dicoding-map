import ApiService from "../data/api-service";

class StoryModel {
  constructor() {
    this._stories = [];
  }

  async getStories(options = {}) {
    try {
      const response = await ApiService.getAllStories(options);
      if (response.error) {
        throw new Error(response.message);
      }

      this._stories = response.listStory;
      return {
        error: false,
        data: this._stories,
      };
    } catch (error) {
      return {
        error: true,
        message: error.message || "Failed to fetch stories",
      };
    }
  }

  async getStoryDetail(id) {
    try {
      const response = await ApiService.getStoryDetail(id);
      if (response.error) {
        throw new Error(response.message);
      }

      return {
        error: false,
        data: response.story,
      };
    } catch (error) {
      return {
        error: true,
        message: error.message || "Failed to fetch story details",
      };
    }
  }

  async addStory(storyData) {
    try {
      const response = await ApiService.addStory(storyData);
      if (response.error) {
        throw new Error(response.message);
      }

      return {
        error: false,
        message: "Story added successfully",
      };
    } catch (error) {
      return {
        error: true,
        message: error.message || "Failed to add story",
      };
    }
  }
}

export default StoryModel;
