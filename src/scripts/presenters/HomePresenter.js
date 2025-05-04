class HomePresenter {
  constructor({ view, storyModel, userModel }) {
    this._view = view;
    this._storyModel = storyModel;
    this._userModel = userModel;

    this._initBindEvents();
  }

  _initBindEvents() {
    // Bind view methods to this presenter
    // This allows the view to call presenter methods when needed
    this._view.onLoadStories = this._loadStories.bind(this);
    this._view.checkAuthentication = this._checkAuthentication.bind(this);
  }

  async _loadStories(options) {
    try {
      const result = await this._storyModel.getStories(options);
      if (result.error) {
        this._view.renderError(result.message);
        return;
      }

      this._view.renderStories(result.data);
    } catch (error) {
      this._view.renderError("Failed to load stories");
    }
  }

  _checkAuthentication() {
    return this._userModel.isAuthenticated();
  }
}

export default HomePresenter;
