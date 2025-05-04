class NotFoundPage {
  async render() {
    return `
      <section class="not-found-container">
        <div class="not-found-content">
          <h2><i class="fa-solid fa-face-frown"></i> Page Not Found</h2>
          <p>Sorry, the page you are looking for doesn't exist or has been moved.</p>
          <a href="#/home" class="btn btn-primary">
            <i class="fa-solid fa-home"></i> Back to Home
          </a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Nothing to do after render
  }
}

export default NotFoundPage;
