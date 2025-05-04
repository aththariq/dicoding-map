class AddStoryPresenter {
  constructor({ view, storyModel, userModel }) {
    this._view = view;
    this._storyModel = storyModel;
    this._userModel = userModel;

    this._initBindEvents();
  }

  _initBindEvents() {
    this._view.onAddStory = this._addStory.bind(this);
    this._view.checkAuthentication = this._checkAuthentication.bind(this);
  }

  async _addStory(storyData) {
    try {
      const result = await this._storyModel.addStory(storyData);
      if (result.error) {
        this._view.showAddStoryError(result.message);
        return;
      }

      this._view.redirectAfterAddStory();
    } catch (error) {
      this._view.showAddStoryError("Failed to add story. Please try again.");
    }
  }

  _checkAuthentication() {
    return this._userModel.isAuthenticated();
  }
}

export default AddStoryPresenter;
