import { Navigate } from "react-router-dom";
import { lazy } from "react";
import LayoutAuth from "../layouts/auth";

const LoginVodeaCloud = lazy(() => import("../pages/auth/LoginVodeaCloud"));
const LoginVodeaCloudCallback = lazy(
  () => import("../pages/auth/LoginVodeaCloudCallback")
);

const routes = [
  {
    path: "/",
    element: <Navigate to={"/auth/login"} />,
  },
  {
    path: "auth",
    element: <LayoutAuth />,
    children: [
      { path: "/", element: <Navigate to={"/auth/vodea-cloud"} /> },
      { path: "login", element: <Navigate to={"/auth/vodea-cloud"} /> },
      { path: "vodea-cloud", element: <LoginVodeaCloud /> },
      { path: "vodea-cloud/callback", element: <LoginVodeaCloudCallback /> },
    ],
  },
];

export default routes;
