// IndexedDB utility for managing offline storage
const IdbHelper = {
  DATABASE_NAME: "dicoding-story-db",
  DATABASE_VERSION: 1,
  OBJECT_STORE_NAME: "stories",

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DATABASE_NAME, this.DATABASE_VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onupgradeneeded = (event) => {
        const database = event.target.result;

        // Create object stores if they don't exist
        if (!database.objectStoreNames.contains(this.OBJECT_STORE_NAME)) {
          database.createObjectStore(this.OBJECT_STORE_NAME, { keyPath: "id" });
          console.log("Stories object store created");
        }

        // We could add more object stores here for other data types
      };
    });
  },

  async saveStories(stories) {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(this.OBJECT_STORE_NAME);

      // Clear existing stories first
      await new Promise((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = (event) => reject(event.target.error);
      });

      // Add all stories one by one
      for (const story of stories) {
        await new Promise((resolve, reject) => {
          const addRequest = store.add(story);
          addRequest.onsuccess = () => resolve();
          addRequest.onerror = (event) => {
            console.error(
              "Error adding story to IndexedDB:",
              event.target.error
            );
            reject(event.target.error);
          };
        });
      }

      return true;
    } catch (error) {
      console.error("Error saving stories to IndexedDB:", error);
      return false;
    }
  },

  async getFavoriteStories() {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.OBJECT_STORE_NAME, "readonly");
      const store = tx.objectStore(this.OBJECT_STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = (event) => {
          resolve(event.target.result || []);
        };

        request.onerror = (event) => {
          console.error(
            "Error getting stories from IndexedDB:",
            event.target.error
          );
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error("Error getting stories from IndexedDB:", error);
      return [];
    }
  },

  async getStory(id) {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.OBJECT_STORE_NAME, "readonly");
      const store = tx.objectStore(this.OBJECT_STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.get(id);

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          console.error(
            `Error getting story ${id} from IndexedDB:`,
            event.target.error
          );
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error(`Error getting story ${id} from IndexedDB:`, error);
      return null;
    }
  },

  async saveStory(story) {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(this.OBJECT_STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.put(story);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error("Error saving story to IndexedDB:", event.target.error);
          reject(event.target.error);
        };

        tx.oncomplete = () => {
          resolve(true);
        };

        tx.onerror = (event) => {
          console.error(
            "Transaction error when saving story:",
            event.target.error
          );
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error("Error saving story to IndexedDB:", error);
      return false;
    }
  },

  async deleteStory(id) {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(this.OBJECT_STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error(
            `Error deleting story ${id} from IndexedDB:`,
            event.target.error
          );
          reject(event.target.error);
        };

        tx.oncomplete = () => {
          resolve(true);
        };

        tx.onerror = (event) => {
          console.error(
            "Transaction error when deleting story:",
            event.target.error
          );
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error(`Error deleting story ${id} from IndexedDB:`, error);
      return false;
    }
  },

  // New methods to better manage data
  async getAllStories() {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.OBJECT_STORE_NAME, "readonly");
      const store = tx.objectStore(this.OBJECT_STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = (event) => {
          resolve(event.target.result || []);
        };

        request.onerror = (event) => {
          console.error(
            "Error getting all stories from IndexedDB:",
            event.target.error
          );
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error("Error getting all stories from IndexedDB:", error);
      return [];
    }
  },

  async clearAllStories() {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(this.OBJECT_STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error(
            "Error clearing IndexedDB stories:",
            event.target.error
          );
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error("Error clearing IndexedDB stories:", error);
      return false;
    }
  },

  async getStoriesCount() {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.OBJECT_STORE_NAME, "readonly");
      const store = tx.objectStore(this.OBJECT_STORE_NAME);

      const countRequest = store.count();

      return new Promise((resolve, reject) => {
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => reject(countRequest.error);
      });
    } catch (error) {
      console.error("Error counting stories in IndexedDB:", error);
      return 0;
    }
  },
};

export default IdbHelper;
