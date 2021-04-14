import React from "react";
import { render, screen } from "@testing-library/react";
import NotFound from "../pages/NotFound";

test("renders learn react link", () => {
  render(<NotFound />);
  const linkElement = screen.getByTestId("not-found");
  expect(linkElement).toBeInTheDocument();
});
