import React from "react";
import { Box } from "@material-ui/core";

interface INumberCell {
  data: string | number;
  defaultValue?: string;
}

const NumberCell: React.FC<INumberCell> = ({ data, defaultValue = "" }) => {
  const value = typeof data === "number" ? data : parseFloat(data);
  return <Box>{isNaN(value) ? "NaN" : value.toLocaleString()}</Box>;
};

export default NumberCell;
