import React, { lazy } from "react";

import PublicLayout from "../layouts/p";

const Unsubscribe = lazy(() => import("../pages/public/unsubscribe"));

const routes = [
  {
    path: "p",
    element: <PublicLayout />,
    children: [{ path: "/unsubscribe", element: <Unsubscribe /> }],
  },
];

export default routes;
