import React from "react";
import logo from "../assets/logo-full.svg";

const LogoFull = () => {
  const { REACT_APP_NAME } = process.env;

  return <img src={logo} alt={REACT_APP_NAME} />;
};

export default LogoFull;
