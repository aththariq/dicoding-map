import HomePage from "../views/pages/home";
import DetailPage from "../views/pages/detail";
import LoginPage from "../views/pages/login";
import RegisterPage from "../views/pages/register";
import AddStoryPage from "../views/pages/add-story";
import NotFoundPage from "../views/pages/not-found";

const routes = {
  "/": new HomePage(),
  "/home": new HomePage(),
  "/detail/:id": new DetailPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/add-story": new AddStoryPage(),
  "/not-found": new NotFoundPage(),
};

export default routes;
