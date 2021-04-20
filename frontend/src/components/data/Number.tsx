import React from "react";

interface INumber {
  data: string | number;
  defaultValue?: string;
  suffix?: string;
  prefix?: string;
}

const Number: React.FC<INumber> = ({
  data,
  prefix,
  suffix,
  defaultValue = "",
}) => {
  const value = typeof data === "number" ? data : parseFloat(data);
  return (
    <>
      {prefix || ""}
      {isNaN(value) ? defaultValue : value.toLocaleString()}
      {suffix || ""}
    </>
  );
};

export default Number;
