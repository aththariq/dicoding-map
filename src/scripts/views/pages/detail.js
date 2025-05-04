import { showFormattedDate } from "../../utils";
import { parseActivePathname } from "../../routes/url-parser";
import StoryModel from "../../models/StoryModel";
import UserModel from "../../models/UserModel";
import DetailPresenter from "../../presenters/DetailPresenter";

class DetailPage {
  constructor() {
    this._storyModel = new StoryModel();
    this._userModel = new UserModel();
    this._presenter = new DetailPresenter({
      view: this,
      storyModel: this._storyModel,
      userModel: this._userModel,
    });
  }

  async render() {
    return `
      <section class="detail-container">
        <div class="loading-indicator">
          <i class="fa-solid fa-spinner fa-spin"></i> Loading story...
        </div>
      </section>
    `;
  }

  async afterRender() {
    const isAuthenticated = this.checkAuthentication();
    if (!isAuthenticated) {
      this._redirectToLogin();
      return;
    }

    const { id } = parseActivePathname();

    if (!id) {
      this.renderError("Invalid story ID");
      return;
    }

    try {
      await this.onLoadStoryDetail(id);
    } catch (error) {
      console.error("Error loading story detail:", error);
      this.renderError("Failed to load story");
    }
  }

  _redirectToLogin() {
    window.location.hash = "#/login";
  }

  renderError(message) {
    const detailContainer = document.querySelector(".detail-container");
    detailContainer.innerHTML = `
      <div class="error-container">
        <h2><i class="fa-solid fa-triangle-exclamation"></i> Error</h2>
        <p>${message}. <a href="#/home">Back to Home</a></p>
      </div>
    `;
  }

  renderStoryDetail(story) {
    const detailContainer = document.querySelector(".detail-container");

    detailContainer.innerHTML = `
      <div class="back-navigation">
        <a href="#/home" class="btn btn-back">
          <i class="fa-solid fa-arrow-left"></i> Back to Stories
        </a>
      </div>
      
      <article class="story-detail">
        <div class="story-detail-header">
          <h2 class="story-detail-title">${story.name}</h2>
          <p class="story-detail-date">
            <i class="fa-solid fa-calendar"></i> ${showFormattedDate(
              story.createdAt
            )}
          </p>
        </div>
        
        <div class="story-detail-image-container">
          <img
            class="story-detail-image"
            src="${story.photoUrl}"
            alt="Photo by ${story.name}"
          />
        </div>
        
        <div class="story-detail-content">
          <p class="story-detail-description">${story.description}</p>
          
          ${
            story.lat && story.lon
              ? `
            <div class="story-location-container">
              <h3><i class="fa-solid fa-location-dot"></i> Location</h3>
              <div id="detailMap" class="detail-map"></div>
              <p class="story-detail-coordinates">
                Coordinates: ${story.lat.toFixed(6)}, ${story.lon.toFixed(6)}
              </p>
            </div>
          `
              : ""
          }
        </div>
      </article>
    `;

    // Initialize map if coordinates are available
    if (story.lat && story.lon) {
      this._initializeMap(story);
    }
  }

  _initializeMap(story) {
    // Load Leaflet map
    if (!window.L) return;

    const map = L.map("detailMap").setView([story.lat, story.lon], 13);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add marker
    const marker = L.marker([story.lat, story.lon]).addTo(map);
    marker
      .bindPopup(
        `<b>${story.name}</b><br>Location: ${story.lat.toFixed(
          6
        )}, ${story.lon.toFixed(6)}`
      )
      .openPopup();
  }
}

export default DetailPage;
