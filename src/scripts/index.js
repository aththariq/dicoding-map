// Import App
import App from "./app";
import ToastInitiator from "./utils/toast-initiator";

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none", // Prevent the browser from using cached versions of the SW
      });
      console.log("Service Worker registered successfully:", registration);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
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
