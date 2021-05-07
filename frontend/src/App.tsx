import React from "react";
import { useRoutes } from "react-router-dom";
import routes from "./routes";

import "./assets/scss/app.scss";

const App: React.FC<any> = () => {
  const routing = useRoutes(routes);
  return <>{routing}</>;
};

export default App;
