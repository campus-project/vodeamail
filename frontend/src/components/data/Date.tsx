import React from "react";
import moment from "moment";
import { Box } from "@material-ui/core";
import { useSelector } from "react-redux";

interface IDate {
  data: string;
  defaultValue?: string;
}

const Date: React.FC<IDate> = ({ data, defaultValue = "" }) => {
  const { date } = useSelector(({ setting }: any) => {
    return {
      date: setting.format.date,
    };
  });

  const value = moment(data);
  return <>{value.isValid() ? value.format(date) : defaultValue}</>;
};

export default Date;
