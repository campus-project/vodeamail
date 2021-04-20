import React from "react";

interface INumberSI {
  data: string | number;
  defaultValue?: string;
}

const NumberSI: React.FC<INumberSI> = ({ data, defaultValue = "" }) => {
  const value = typeof data === "number" ? data : parseFloat(data);
  if (isNaN(value)) {
    return <>{defaultValue}</>;
  }

  return (
    <>
      {Math.abs(Number(value)) >= 1.0e9
        ? (Math.abs(Number(value)) / 1.0e9).toLocaleString() + "B"
        : Math.abs(Number(value)) >= 1.0e6
        ? (Math.abs(Number(value)) / 1.0e6).toLocaleString() + "M"
        : Math.abs(Number(value)) >= 1.0e3
        ? (Math.abs(Number(value)) / 1.0e3).toLocaleString() + "K"
        : Math.abs(Number(value))}
    </>
  );
};

export default NumberSI;
