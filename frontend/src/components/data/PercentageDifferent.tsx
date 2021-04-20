import React from "react";
import Percentage from "./Percentage";

interface IPercentageDifferent {
  v1: string | number;
  v2: string | number;
  defaultValue?: string;
}

const PercentageDifferent: React.FC<IPercentageDifferent> = ({
  v1,
  v2,
  defaultValue = "",
}) => {
  const firstValue = typeof v1 === "number" ? v1 : parseFloat(v1);
  const secondValue = typeof v2 === "number" ? v2 : parseFloat(v2);

  if (isNaN(firstValue) || isNaN(secondValue)) {
    return <Percentage data={0} defaultValue={defaultValue} />;
  }

  const value = (firstValue / secondValue) * 100;
  return <Percentage data={value} />;
};

export default PercentageDifferent;
