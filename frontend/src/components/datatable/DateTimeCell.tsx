import React from "react";
import moment from "moment";
import { Box } from "@material-ui/core";
import { useSelector } from "react-redux";

interface IDateTimeCell {
  data: string;
  defaultValue?: string;
}

const DateTimeCell: React.FC<IDateTimeCell> = ({ data, defaultValue = "" }) => {
  const { datetime } = useSelector(({ setting }: any) => {
    return {
      datetime: setting.format.datetime,
    };
  });

  const value = moment(data);
  return <Box>{value.isValid() ? value.format(datetime) : defaultValue}</Box>;
};

export default DateTimeCell;
