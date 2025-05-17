// Import App
import App from "./app";
import ToastInitiator from "./utils/toast-initiator";

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered successfully:", registration);
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize Toast
  ToastInitiator.init();

  const app = new App({
    content: document.querySelector("#mainContent"),
    drawerButton: document.querySelector("#hamburgerButton"),
    navigationDrawer: document.querySelector("#navigationDrawer"),
  });

  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
