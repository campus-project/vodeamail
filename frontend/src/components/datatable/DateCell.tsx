import React from "react";
import moment from "moment";
import { Box } from "@material-ui/core";
import { useSelector } from "react-redux";

interface IDateCell {
  data: string;
  defaultValue?: string;
}

const DateCell: React.FC<IDateCell> = ({ data, defaultValue = "" }) => {
  const { date } = useSelector(({ setting }: any) => {
    return {
      date: setting.format.date,
    };
  });

  const value = moment(data);
  return <Box>{value.isValid() ? value.format(date) : defaultValue}</Box>;
};

export default DateCell;
