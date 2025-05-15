import AuthHelper from "./auth-helper";
import DrawerInitiator from "./drawer-initiator";
import NotificationHelper from "./notification-helper";
import IdbHelper from "./idb-helper";

export function showFormattedDate(date, locale = "en-US", options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export { AuthHelper, DrawerInitiator, NotificationHelper, IdbHelper };
