class HomePresenter {
  constructor({ view, storyModel, userModel }) {
    this._view = view;
    this._storyModel = storyModel;
    this._userModel = userModel;
    this._favoriteIds = [];

    this._initBindEvents();
  }

  _initBindEvents() {
    // Bind view methods to this presenter
    this._view.onLoadStories = this._loadStories.bind(this);
    this._view.onLoadFavorites = this._loadFavorites.bind(this);
    this._view.onAddToFavorites = this._addToFavorites.bind(this);
    this._view.onRemoveFromFavorites = this._removeFromFavorites.bind(this);
    this._view.checkAuthentication = this._checkAuthentication.bind(this);

    // Load favorites IDs for later comparison
    this._loadFavoriteIds();
  }

  async _loadStories(options) {
    try {
      const result = await this._storyModel.getStories(options);
      if (result.error) {
        this._view.renderError(result.message);
        return;
      }

      await this._loadFavoriteIds();
      this._view.favoriteIds = this._favoriteIds;
      this._view.renderStories(result.data, result.source);
    } catch (error) {
      this._view.renderError("Failed to load stories");
    }
  }

  async _loadFavorites() {
    try {
      const result = await this._storyModel.getFavorites();
      if (result.error) {
        this._view.renderError(result.message);
        return;
      }

      await this._loadFavoriteIds();
      this._view.favoriteIds = this._favoriteIds;
      this._view.renderStories(result.data, "indexeddb");
    } catch (error) {
      this._view.renderError("Failed to load favorite stories");
    }
  }

  async _loadFavoriteIds() {
    try {
      const favoritesResult = await this._storyModel.getFavorites();
      if (!favoritesResult.error && favoritesResult.data) {
        this._favoriteIds = favoritesResult.data.map((story) => story.id);
      }
    } catch (error) {
      console.error("Error loading favorite IDs:", error);
      this._favoriteIds = [];
    }
  }

  async _addToFavorites(story) {
    try {
      const result = await this._storyModel.saveToFavorites(story);
      if (result.error) {
        console.error(result.message);
        return false;
      }

      // Update local favorite IDs
      if (!this._favoriteIds.includes(story.id)) {
        this._favoriteIds.push(story.id);
      }

      return true;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      return false;
    }
  }

  async _removeFromFavorites(storyId) {
    try {
      const result = await this._storyModel.removeFromFavorites(storyId);
      if (result.error) {
        console.error(result.message);
        return false;
      }

      // Update local favorite IDs
      this._favoriteIds = this._favoriteIds.filter((id) => id !== storyId);

      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return false;
    }
  }

  _checkAuthentication() {
    return this._userModel.isAuthenticated();
  }
}

export default HomePresenter;
