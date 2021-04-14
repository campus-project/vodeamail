import React from "react";
import moment from "moment";
import { useSelector } from "react-redux";

interface IDateTime {
  data: string;
  defaultValue?: string;
}

const DateTime: React.FC<IDateTime> = ({ data, defaultValue = "" }) => {
  const { datetime } = useSelector(({ setting }: any) => {
    return {
      datetime: setting.format.datetime,
    };
  });

  const value = moment(data);
  return <>{value.isValid() ? value.format(datetime) : defaultValue}</>;
};

export default DateTime;
