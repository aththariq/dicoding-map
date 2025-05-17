import IdbHelper from './idb-helper';

const DataManager = {
  async init({ container }) {
    this._container = container;
    
    if (!this._container) {
      console.error('Data manager container not found');
      return;
    }
    
    await this._renderControls();
    this._setupEventListeners();
  },
  
  async _renderControls() {
    const storiesCount = await IdbHelper.getStoriesCount();
    
    this._container.innerHTML = `
      <div class="data-manager">
        <div class="data-manager__header">
          <h3><i class="fa-solid fa-database"></i> IndexedDB Data Manager</h3>
          <p class="data-manager__stats">
            Currently stored stories: <span id="storiesCount">${storiesCount}</span>
          </p>
        </div>
        <div class="data-manager__actions">
          <button id="clearDataBtn" class="btn btn-outline btn-small">
            <i class="fa-solid fa-trash"></i> Clear All Data
          </button>
          <button id="updateDataBtn" class="btn btn-primary btn-small">
            <i class="fa-solid fa-sync"></i> Update Cached Data
          </button>
        </div>
      </div>
    `;
  },
  
  _setupEventListeners() {
    const clearDataBtn = document.getElementById('clearDataBtn');
    const updateDataBtn = document.getElementById('updateDataBtn');
    
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all cached stories?')) {
          clearDataBtn.disabled = true;
          clearDataBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Clearing...';
          
          try {
            await IdbHelper.clearAllStories();
            await this._updateStoriesCount();
            this._showToast('All cached stories cleared successfully');
          } catch (error) {
            console.error('Error clearing data:', error);
            this._showToast('Failed to clear data', true);
          } finally {
            clearDataBtn.disabled = false;
            clearDataBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Clear All Data';
          }
        }
      });
    }
    
    if (updateDataBtn) {
      updateDataBtn.addEventListener('click', async () => {
        updateDataBtn.disabled = true;
        updateDataBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';
        
        try {
          // This will trigger a reload of stories from the API and update IndexedDB
          const event = new CustomEvent('refresh-stories');
          document.dispatchEvent(event);
          
          // Update UI after a short delay to allow the refresh to happen
          setTimeout(async () => {
            await this._updateStoriesCount();
            this._showToast('Stories cache updated');
            updateDataBtn.disabled = false;
            updateDataBtn.innerHTML = '<i class="fa-solid fa-sync"></i> Update Cached Data';
          }, 1500);
        } catch (error) {
          console.error('Error updating data:', error);
          this._showToast('Failed to update data', true);
          updateDataBtn.disabled = false;
          updateDataBtn.innerHTML = '<i class="fa-solid fa-sync"></i> Update Cached Data';
        }
      });
    }
  },
  
  async _updateStoriesCount() {
    const countElement = document.getElementById('storiesCount');
    if (countElement) {
      const count = await IdbHelper.getStoriesCount();
      countElement.textContent = count;
    }
  },
  
  _showToast(message, isError = false) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
    toast.innerHTML = `
      <div class="toast__content">
        <i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // Hide and remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
};

export default DataManager;
