import React from "react";
import { useDocumentTitle } from "../utilities/hooks";

const NotFound = () => {
  useDocumentTitle("404 - Halaman Tidak Ditemukan");

  return <div data-testid={"not-found"}>Tidak Ditemukan!</div>;
};

export default NotFound;
