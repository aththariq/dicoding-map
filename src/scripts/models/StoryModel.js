import ApiService from "../data/api-service";
import { IdbHelper } from "../utils";

class StoryModel {
  constructor() {
    this._stories = [];
  }

  async getStories(options = {}) {
    try {
      // Try to fetch from API first
      const response = await ApiService.getAllStories(options);
      if (!response.error) {
        this._stories = response.listStory;

        // Save to IndexedDB for offline use
        await IdbHelper.saveStories(this._stories);

        return {
          error: false,
          data: this._stories,
          source: "api",
        };
      }

      throw new Error(response.message || "Failed to fetch stories");
    } catch (error) {
      console.warn("Failed to fetch from API, trying IndexedDB...", error);

      try {
        // Fall back to IndexedDB if API fails
        const offlineStories = await IdbHelper.getFavoriteStories();

        if (offlineStories && offlineStories.length > 0) {
          return {
            error: false,
            data: offlineStories,
            source: "indexeddb",
          };
        } else {
          return {
            error: true,
            message: "No stories available offline",
          };
        }
      } catch (offlineError) {
        console.error("Error fetching from IndexedDB:", offlineError);
        return {
          error: true,
          message: "Failed to fetch stories. Please check your connection.",
        };
      }
    }
  }

  async getStoryDetail(id) {
    try {
      // Try API first
      const response = await ApiService.getStoryDetail(id);
      if (!response.error) {
        const story = response.story;

        // Save individual story to IndexedDB
        await IdbHelper.saveStory(story);

        return {
          error: false,
          data: story,
          source: "api",
        };
      }

      throw new Error(response.message || "Failed to fetch story details");
    } catch (error) {
      console.warn(
        "Failed to fetch story from API, trying IndexedDB...",
        error
      );

      try {
        // Try to get from IndexedDB
        const offlineStory = await IdbHelper.getStory(id);

        if (offlineStory) {
          return {
            error: false,
            data: offlineStory,
            source: "indexeddb",
          };
        } else {
          return {
            error: true,
            message: "Story not available offline",
          };
        }
      } catch (offlineError) {
        console.error("Error fetching from IndexedDB:", offlineError);
        return {
          error: true,
          message: "Failed to fetch story details",
        };
      }
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

  async saveToFavorites(story) {
    try {
      await IdbHelper.saveStory(story);
      return {
        error: false,
        message: "Story saved to favorites",
      };
    } catch (error) {
      console.error("Error saving to favorites:", error);
      return {
        error: true,
        message: "Failed to save story",
      };
    }
  }

  async removeFromFavorites(id) {
    try {
      await IdbHelper.deleteStory(id);
      return {
        error: false,
        message: "Story removed from favorites",
      };
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return {
        error: true,
        message: "Failed to remove story",
      };
    }
  }

  async getFavorites() {
    try {
      const favorites = await IdbHelper.getFavoriteStories();
      return {
        error: false,
        data: favorites || [],
      };
    } catch (error) {
      console.error("Error getting favorites:", error);
      return {
        error: true,
        message: "Failed to get favorite stories",
        data: [],
      };
    }
  }
}

export default StoryModel;
