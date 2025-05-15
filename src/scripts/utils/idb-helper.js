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
    const db = await this.openDB();
    const tx = db.transaction(this.OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(this.OBJECT_STORE_NAME);

    // Clear existing stories
    await store.clear();

    // Add all stories
    stories.forEach((story) => {
      store.add(story);
    });

    return tx.complete;
  },

  async getFavoriteStories() {
    const db = await this.openDB();
    const tx = db.transaction(this.OBJECT_STORE_NAME, "readonly");
    const store = tx.objectStore(this.OBJECT_STORE_NAME);

    return store.getAll();
  },

  async getStory(id) {
    const db = await this.openDB();
    const tx = db.transaction(this.OBJECT_STORE_NAME, "readonly");
    const store = tx.objectStore(this.OBJECT_STORE_NAME);

    return store.get(id);
  },

  async saveStory(story) {
    const db = await this.openDB();
    const tx = db.transaction(this.OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(this.OBJECT_STORE_NAME);

    store.put(story);
    return tx.complete;
  },

  async deleteStory(id) {
    const db = await this.openDB();
    const tx = db.transaction(this.OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(this.OBJECT_STORE_NAME);

    store.delete(id);
    return tx.complete;
  },
};

export default IdbHelper;
