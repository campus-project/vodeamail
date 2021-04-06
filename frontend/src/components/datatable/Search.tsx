import React from "react";
import MuiTextField, { MuiTextFieldProps } from "../ui/form/MuiTextField";
import { Search } from "@material-ui/icons";
import { InputAdornment } from "@material-ui/core";
import { useTranslation } from "react-i18next";

export interface MuiDatatableSearchProps {
  icon?: boolean;
}

const MuiDatatableSearch: React.FC<
  MuiTextFieldProps & MuiDatatableSearchProps
> = (props) => {
  const { t } = useTranslation();
  const { icon = true, ...others } = props;

  Object.assign(others, {
    size: "small",
    placeholder: t("datatable:search"),
  });

  return (
    <MuiTextField
      {...others}
      InputProps={
        icon
          ? {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }
          : {}
      }
    />
  );
};

export default MuiDatatableSearch;
