// CSS imports
import "../styles/main.css";
import "../styles/styles.css";

import App from "./app";

document.addEventListener("DOMContentLoaded", async () => {
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
