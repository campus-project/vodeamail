import React from "react";

interface INumber {
  data: string | number;
  defaultValue?: string;
}

const Number: React.FC<INumber> = ({ data, defaultValue = "" }) => {
  const value = typeof data === "number" ? data : parseFloat(data);
  return <>{isNaN(value) ? defaultValue || "NaN" : value.toLocaleString()}</>;
};

export default Number;
