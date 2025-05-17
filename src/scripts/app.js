import {
  DrawerInitiator,
  AuthHelper,
  InstallHelper,
  NotificationButton,
} from "./utils";
import { getActiveRoute } from "./routes/url-parser";
import routes from "./routes/routes";

class App {
  constructor({ content, navigationDrawer, drawerButton }) {
    this._content = content;
    this._navigationDrawer = navigationDrawer;
    this._drawerButton = drawerButton;

    this._initialAppShell();
  }

  _initialAppShell() {
    // Initialize drawer
    DrawerInitiator.init({
      button: this._drawerButton,
      drawer: this._navigationDrawer,
      content: this._content,
    });

    // Initialize PWA install banner
    InstallHelper.init({
      installContainer: document.getElementById("installBanner"),
    });

    // Initialize notification button
    const notificationButtonContainer =
      document.getElementById("notificationButton");
    if (notificationButtonContainer) {
      NotificationButton.init({
        container: notificationButtonContainer,
      });
    }

    // Set current year in footer
    document.getElementById("year").textContent = new Date().getFullYear();

    // Check authentication status and update UI
    AuthHelper.checkAuthentication();
  }

  async renderPage() {
    try {
      // Get the active route path
      const route = getActiveRoute();

      // Get the page module based on route
      const page = routes[route];

      if (!page) {
        const NotFoundPage = routes["/not-found"];
        this._content.innerHTML = await NotFoundPage.render();
        await NotFoundPage.afterRender();
        return;
      }

      // Register the View Transition API
      if (document.startViewTransition) {
        const transition = document.startViewTransition(async () => {
          this._content.innerHTML = await page.render();
        });

        // Wait for the transition to complete before running afterRender
        await transition.finished;
        await page.afterRender();
      } else {
        // Fallback for browsers that don't support View Transition API
        this._content.innerHTML = await page.render();
        await page.afterRender();
      }

      // Check authentication status after page render
      AuthHelper.checkAuthentication();
    } catch (error) {
      console.error("Error rendering page:", error);
      this._content.innerHTML = `<div class="error-container">
        <h2><i class="fa-solid fa-triangle-exclamation"></i> Error</h2>
        <p>Sorry, there was an error loading the page. Please try again.</p>
      </div>`;
    }
  }
}

export default App;
