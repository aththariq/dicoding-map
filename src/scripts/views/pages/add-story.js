import { NotificationHelper } from "../../utils";
import StoryModel from "../../models/StoryModel";
import UserModel from "../../models/UserModel";
import AddStoryPresenter from "../../presenters/AddStoryPresenter";

class AddStoryPage {
  constructor() {
    this._storyModel = new StoryModel();
    this._userModel = new UserModel();
    this._presenter = new AddStoryPresenter({
      view: this,
      storyModel: this._storyModel,
      userModel: this._userModel,
    });
    this.stream = null;
    this.marker = null;
    this.map = null;
    this.capturedPhoto = null;
  }

  async render() {
    return `
      <section class="add-story-container">
        <h2 class="page-title"><i class="fa-solid fa-plus"></i> Add New Story</h2>
        
        <div class="card">
          <form id="addStoryForm">
            <div class="form-group">
              <label for="description">Your Story</label>
              <textarea
                id="description"
                name="description"
                placeholder="Share your story here..."
                required
                rows="4"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>Take a Photo</label>
              <div class="camera-container">
                <div class="camera-preview-container">
                  <video id="cameraPreview" autoplay playsinline class="camera-preview"></video>
                  <canvas id="cameraCanvas" class="camera-canvas hidden"></canvas>
                  <img id="capturedImage" class="captured-image hidden" alt="Captured image preview" />
                </div>
                
                <div class="camera-controls">
                  <button type="button" id="startCameraBtn" class="btn btn-secondary">
                    <i class="fa-solid fa-camera"></i> Open Camera
                  </button>
                  <button type="button" id="captureImageBtn" class="btn btn-primary hidden">
                    <i class="fa-solid fa-camera"></i> Capture
                  </button>
                  <button type="button" id="retakeImageBtn" class="btn btn-secondary hidden">
                    <i class="fa-solid fa-rotate"></i> Retake
                  </button>
                </div>
                
                <div class="upload-container">
                  <p>Or upload from your device:</p>
                  <div class="input-group">
                    <label for="imageUpload" class="btn btn-outline">
                      <i class="fa-solid fa-upload"></i> Choose File
                    </label>
                    <input
                      type="file"
                      id="imageUpload"
                      name="imageUpload"
                      accept="image/*"
                      class="hidden"
                    />
                    <span id="uploadFileName">No file chosen</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="locationMap">Location (Optional)</label>
              <p class="location-help">Click on the map to set your story location</p>
              <div id="locationMap" class="location-map"></div>
              
              <div class="location-info">
                <div class="input-group">
                  <i class="fa-solid fa-location-dot input-icon"></i>
                  <input
                    type="text"
                    id="locationCoordinates"
                    placeholder="No location selected"
                    readonly
                  />
                  <button type="button" id="clearLocationBtn" class="btn btn-small hidden">
                    <i class="fa-solid fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="form-alert" id="storyAlert"></div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-block">
                <i class="fa-solid fa-paper-plane"></i> Post Story
              </button>
            </div>
          </form>
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

    this._initializeMap();
    this._initializeCamera();
    this._setupForm();
  }

  _redirectToLogin() {
    window.location.hash = "#/login";
  }

  _setupForm() {
    const addStoryForm = document.getElementById("addStoryForm");
    const storyAlert = document.getElementById("storyAlert");
    const imageUpload = document.getElementById("imageUpload");
    const uploadFileName = document.getElementById("uploadFileName");

    // Handle file upload change
    imageUpload.addEventListener("change", (event) => {
      if (event.target.files && event.target.files[0]) {
        const fileName = event.target.files[0].name;
        uploadFileName.textContent = fileName;

        // Preview uploaded image
        const reader = new FileReader();
        reader.onload = (e) => {
          const capturedImage = document.getElementById("capturedImage");
          capturedImage.src = e.target.result;

          document.getElementById("cameraPreview").classList.add("hidden");
          document.getElementById("cameraCanvas").classList.add("hidden");
          capturedImage.classList.remove("hidden");

          // Stop camera if running
          this._stopCameraStream();
        };
        reader.readAsDataURL(event.target.files[0]);
      }
    });

    // Handle form submission
    addStoryForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Clear previous alerts
      storyAlert.textContent = "";
      storyAlert.classList.remove("alert-success", "alert-danger");

      // Show loading state
      const submitButton = addStoryForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      submitButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Posting...';
      submitButton.disabled = true;

      try {
        const description = document.getElementById("description").value;
        const locationCoordinates = document.getElementById(
          "locationCoordinates"
        );

        let lat, lon;
        if (locationCoordinates.value && this.marker) {
          const position = this.marker.getLatLng();
          lat = position.lat;
          lon = position.lng;
        }

        // Get image from either camera or upload
        let photo = null;
        const capturedImage = document.getElementById("capturedImage");

        if (!capturedImage.classList.contains("hidden") && capturedImage.src) {
          // For uploaded files
          if (imageUpload.files && imageUpload.files[0]) {
            photo = imageUpload.files[0];
          } else {
            // For captured images
            const canvas = document.getElementById("cameraCanvas");
            if (canvas) {
              // Convert to a Promise to properly handle the async operation
              photo = await new Promise((resolve) => {
                canvas.toBlob(
                  (blob) => {
                    if (blob) {
                      resolve(
                        new File([blob], "camera-capture.jpg", {
                          type: "image/jpeg",
                        })
                      );
                    } else {
                      resolve(null);
                    }
                  },
                  "image/jpeg",
                  0.9
                );
              });
            }
          }
        }

        if (!photo) {
          throw new Error("Please capture or upload an image for your story");
        }

        // Store captured photo in instance variable
        this.capturedPhoto = photo;

        // Create story data object
        const storyData = {
          description,
          photo,
          lat,
          lon,
        };

        // Use the presenter to add the story
        await this.onAddStory(storyData);

        // Request push notification subscription
        try {
          await NotificationHelper.subscribeToPushNotification();
        } catch (notificationError) {
          console.warn(
            "Failed to subscribe to notifications:",
            notificationError
          );
        }
      } catch (error) {
        console.error("Error posting story:", error);
        this.showAddStoryError(
          error.message || "Failed to post story. Please try again."
        );

        // Reset button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
      }
    });
  }

  showAddStoryError(message) {
    const storyAlert = document.getElementById("storyAlert");
    const submitButton = document.querySelector(
      '#addStoryForm button[type="submit"]'
    );

    storyAlert.textContent = message;
    storyAlert.classList.add("alert-danger");

    // Reset button
    submitButton.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Post Story`;
    submitButton.disabled = false;
  }

  redirectAfterAddStory() {
    const storyAlert = document.getElementById("storyAlert");
    const addStoryForm = document.getElementById("addStoryForm");
    const uploadFileName = document.getElementById("uploadFileName");

    // Show success message
    storyAlert.textContent = "Story posted successfully!";
    storyAlert.classList.add("alert-success");

    // Reset form
    addStoryForm.reset();
    uploadFileName.textContent = "No file chosen";
    this._resetCameraAndImage();
    this._clearLocation();

    // Redirect to home page after a delay
    setTimeout(() => {
      window.location.hash = "#/home";
    }, 2000);
  }

  _initializeMap() {
    // Load Leaflet map
    if (!window.L) return;

    const map = L.map("locationMap").setView([-2.548926, 118.0148634], 5);
    this.map = map;

    // Add tile layers with multiple options
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

    // Set up base layers
    const baseLayers = {
      Default: defaultLayer,
      Satellite: satelliteLayer,
    };

    // Add the default layer to the map
    defaultLayer.addTo(map);

    // Add layer control
    L.control.layers(baseLayers).addTo(map);

    // Handle map click
    map.on("click", (e) => {
      this._setLocationMarker(e.latlng);
    });

    // Setup clear location button
    const clearLocationBtn = document.getElementById("clearLocationBtn");
    clearLocationBtn.addEventListener("click", () => {
      this._clearLocation();
    });
  }

  _setLocationMarker(latlng) {
    const { lat, lng } = latlng;

    // Remove existing marker if any
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Add new marker
    this.marker = L.marker(latlng).addTo(this.map);

    // Update coordinates display
    const locationCoordinates = document.getElementById("locationCoordinates");
    locationCoordinates.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    // Show clear button
    document.getElementById("clearLocationBtn").classList.remove("hidden");
  }

  _clearLocation() {
    // Remove marker if exists
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }

    // Clear coordinates input
    const locationCoordinates = document.getElementById("locationCoordinates");
    locationCoordinates.value = "";

    // Hide clear button
    document.getElementById("clearLocationBtn").classList.add("hidden");
  }

  _initializeCamera() {
    const startCameraBtn = document.getElementById("startCameraBtn");
    const captureImageBtn = document.getElementById("captureImageBtn");
    const retakeImageBtn = document.getElementById("retakeImageBtn");

    startCameraBtn.addEventListener("click", async () => {
      try {
        await this._startCamera();
        startCameraBtn.classList.add("hidden");
        captureImageBtn.classList.remove("hidden");
      } catch (error) {
        console.error("Error starting camera:", error);
        alert(
          "Failed to start camera. Please ensure you have granted camera permissions."
        );
      }
    });

    captureImageBtn.addEventListener("click", () => {
      this._captureImage();
      captureImageBtn.classList.add("hidden");
      retakeImageBtn.classList.remove("hidden");
    });

    retakeImageBtn.addEventListener("click", () => {
      this._resetCamera();
      captureImageBtn.classList.remove("hidden");
      retakeImageBtn.classList.add("hidden");
    });
  }

  async _startCamera() {
    const video = document.getElementById("cameraPreview");

    // Request camera access
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment", // Use back camera if available
      },
      audio: false,
    });

    // Connect stream to video element
    video.srcObject = this.stream;
    video.classList.remove("hidden");

    document.getElementById("capturedImage").classList.add("hidden");
  }

  _captureImage() {
    const video = document.getElementById("cameraPreview");
    const canvas = document.getElementById("cameraCanvas");
    const capturedImage = document.getElementById("capturedImage");

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to image
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    capturedImage.src = imageDataUrl;

    // Make sure canvas is available for later processing
    canvas.classList.remove("hidden");

    // Hide video, show captured image
    video.classList.add("hidden");
    capturedImage.classList.remove("hidden");

    // Stop the camera stream after capturing the image
    this._stopCameraStream();
  }

  _resetCamera() {
    const video = document.getElementById("cameraPreview");
    const capturedImage = document.getElementById("capturedImage");

    // Stop any existing stream first
    this._stopCameraStream();

    // Start the camera again
    this._startCamera().catch((error) => {
      console.error("Error restarting camera:", error);
      alert("Failed to restart camera. Please try again.");
    });

    // Show video again, hide captured image
    video.classList.remove("hidden");
    capturedImage.classList.add("hidden");
  }

  _resetCameraAndImage() {
    this._stopCameraStream();

    // Reset UI elements
    document.getElementById("cameraPreview").classList.add("hidden");
    document.getElementById("capturedImage").classList.add("hidden");
    document.getElementById("startCameraBtn").classList.remove("hidden");
    document.getElementById("captureImageBtn").classList.add("hidden");
    document.getElementById("retakeImageBtn").classList.add("hidden");
  }

  _stopCameraStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
      this.stream = null;
    }
  }
}

export default AddStoryPage;
