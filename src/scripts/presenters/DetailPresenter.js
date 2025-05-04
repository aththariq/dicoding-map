class DetailPresenter {
  constructor({ view, storyModel, userModel }) {
    this._view = view;
    this._storyModel = storyModel;
    this._userModel = userModel;

    this._initBindEvents();
  }

  _initBindEvents() {
    this._view.onLoadStoryDetail = this._loadStoryDetail.bind(this);
    this._view.checkAuthentication = this._checkAuthentication.bind(this);
  }

  async _loadStoryDetail(id) {
    try {
      const result = await this._storyModel.getStoryDetail(id);
      if (result.error) {
        this._view.renderError(result.message);
        return;
      }

      this._view.renderStoryDetail(result.data);
    } catch (error) {
      this._view.renderError("Failed to load story details");
    }
  }

  _checkAuthentication() {
    return this._userModel.isAuthenticated();
  }
}

export default DetailPresenter;
