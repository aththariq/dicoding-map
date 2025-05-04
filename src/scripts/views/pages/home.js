import { showFormattedDate } from "../../utils";
import StoryModel from "../../models/StoryModel";
import UserModel from "../../models/UserModel";
import HomePresenter from "../../presenters/HomePresenter";

class HomePage {
  constructor() {
    this._storyModel = new StoryModel();
    this._userModel = new UserModel();
    this._presenter = new HomePresenter({
      view: this,
      storyModel: this._storyModel,
      userModel: this._userModel,
    });
  }

  async render() {
    return `
      <section class="home-container">
        <h2 class="page-title"><i class="fa-solid fa-book-open"></i> Story Feed</h2>
        <div class="story-map-container">
          <div id="storyMap" class="story-map"></div>
        </div>
        <div class="story-list-container" id="storyList">
          <div class="loading-indicator">
            <i class="fa-solid fa-spinner fa-spin"></i> Loading stories...
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const isAuthenticated = this.checkAuthentication();

    if (!isAuthenticated) {
      this._showAuthenticationRequired();
      return;
    }

    try {
      await this._initializeMap();
      await this.onLoadStories({ withLocation: true });
    } catch (error) {
      console.error("Error initializing home page:", error);
      this.renderError("Failed to load stories. Please try again later.");
    }
  }

  _showAuthenticationRequired() {
    const storyListContainer = document.getElementById("storyList");
    storyListContainer.innerHTML = `
      <div class="not-authenticated">
        <h3><i class="fa-solid fa-lock"></i> Login Required</h3>
        <p>Please <a href="#/login">login</a> or <a href="#/register">register</a> to view stories.</p>
      </div>
    `;
  }

  renderStories(stories) {
    const storyListContainer = document.getElementById("storyList");

    if (stories.length === 0) {
      storyListContainer.innerHTML = `
        <div class="empty-state">
          <h3><i class="fa-solid fa-face-sad-tear"></i> No Stories Found</h3>
          <p>Be the first to <a href="#/add-story">create a story</a>!</p>
        </div>
      `;
      return;
    }

    // Render stories
    storyListContainer.innerHTML = "";
    stories.forEach((story) => {
      this._addStoryMarker(story);

      const storyElement = document.createElement("article");
      storyElement.classList.add("story-item");
      storyElement.innerHTML = `
        <div class="story-header">
          <h3 class="story-title">${story.name}</h3>
          <p class="story-date">${showFormattedDate(story.createdAt)}</p>
        </div>
        <div class="story-image-container">
          <img
            class="story-image"
            src="${story.photoUrl}"
            alt="Photo by ${story.name}"
            loading="lazy"
          />
        </div>
        <div class="story-content">
          <p class="story-description">${story.description}</p>
          ${
            story.lat && story.lon
              ? `
            <p class="story-location">
              <i class="fa-solid fa-location-dot"></i> Location: ${story.lat.toFixed(
                3
              )}, ${story.lon.toFixed(3)}
            </p>
          `
              : ""
          }
          <a href="#/detail/${story.id}" class="btn-read-more">
            <i class="fa-solid fa-arrow-right"></i> Read More
          </a>
        </div>
      `;

      storyListContainer.appendChild(storyElement);
    });
  }

  renderError(message) {
    const storyListContainer = document.getElementById("storyList");
    storyListContainer.innerHTML = `
      <div class="error-container">
        <h3><i class="fa-solid fa-triangle-exclamation"></i> Error</h3>
        <p>${message}</p>
      </div>
    `;
  }

  async _initializeMap() {
    // Load Leaflet map
    if (!window.L) return;

    const map = L.map("storyMap").setView([-2.548926, 118.0148634], 5);
    this.map = map;

    // Add tile layer with multiple layer options
    const defaultLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      }
    );

    const terrainLayer = L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      }
    );

    // Set up base layers
    const baseLayers = {
      Default: defaultLayer,
      Satellite: satelliteLayer,
      Terrain: terrainLayer,
    };

    // Add the default layer to the map
    defaultLayer.addTo(map);

    // Add layer control
    L.control.layers(baseLayers).addTo(map);

    // Add markers group
    this.markersLayer = L.layerGroup().addTo(map);
  }

  _addStoryMarker(story) {
    if (!this.map || !story.lat || !story.lon) return;

    const marker = L.marker([story.lat, story.lon]).addTo(this.markersLayer);

    marker.bindPopup(`
      <div class="map-popup">
        <h4>${story.name}</h4>
        <img 
          src="${story.photoUrl}" 
          alt="Story by ${story.name}" 
          class="popup-image"
        />
        <p>${story.description.substring(0, 100)}${
      story.description.length > 100 ? "..." : ""
    }</p>
        <a href="#/detail/${story.id}" class="popup-link">View Details</a>
      </div>
    `);
  }
}

export default HomePage;
