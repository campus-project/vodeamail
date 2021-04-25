import React, { lazy } from "react";
import auth from "./auth";
import apps from "./apps";
import p from "./public";

const Home = lazy(() => import("../pages/Home"));
const Logout = lazy(() => import("../pages/Logout"));
const NotFound = lazy(() => import("../pages/NotFound"));

const routes = [
  { path: "/", element: <Home /> },
  { path: "/logout", element: <Logout /> },
  ...auth,
  ...apps,
  ...p,
  { path: "*", element: <NotFound /> },
];

export default routes;
