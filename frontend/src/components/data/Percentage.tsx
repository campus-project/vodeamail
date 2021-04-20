import React from "react";

interface IPercentage {
  data: string | number;
  defaultValue?: string;
}

const Percentage: React.FC<IPercentage> = ({ data, defaultValue = "" }) => {
  const value = typeof data === "number" ? data : parseFloat(data);
  return <>{isNaN(value) ? defaultValue : value.toLocaleString()}%</>;
};

export default Percentage;
