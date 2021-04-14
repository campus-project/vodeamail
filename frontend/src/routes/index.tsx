import React, { lazy } from "react";
import auth from "./auth";
import apps from "./apps";

const Home = lazy(() => import("../pages/Home"));
const Logout = lazy(() => import("../pages/Logout"));
const NotFound = lazy(() => import("../pages/NotFound"));

const routes = [
  { path: "/", element: <Home /> },
  { path: "/logout", element: <Logout /> },
  ...auth,
  ...apps,
  { path: "*", element: <NotFound /> },
];

export default routes;
