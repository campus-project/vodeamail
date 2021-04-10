import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { useState } from "@hookstate/core";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import MuiTextField, { MuiTextFieldProps } from "./MuiTextField";
import React, { useEffect } from "react";
import { useIsMounted } from "../../../utilities/hooks";
import { AxiosResponse } from "axios";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { $cloneState, axiosErrorHandler } from "../../../utilities/helpers";

export interface IParams {
  [key: string]: string | number | Array<string | number>;
}

export type TypeFunctionOptionLabel = (option: any) => string;
export type TypeFunctionOptionSelected = (option: any, value: any) => boolean;

export interface MuiAutoCompleteProps
  extends Omit<
    AutocompleteProps<any, any, any, any>,
    "renderInput" | "options"
  > {
  repository: any;
  onSelected: (option: any) => void;
  isKeepClear?: boolean;
  optionLabel?: string | TypeFunctionOptionLabel;
  optionSelected?: string | TypeFunctionOptionSelected;
  params?: IParams;
  muiTextField?: MuiTextFieldProps;
}

const MuiAutoComplete = withStyles((theme: Theme) =>
  createStyles({
    root: {},
  })
)((props: MuiAutoCompleteProps) => {
  const {
    repository,
    onSelected,
    isKeepClear = false,
    optionLabel = "name",
    optionSelected = "id",
    params = {},
    muiTextField = {},
    ...others
  } = props;
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const { enqueueSnackbar } = useSnackbar();

  const options = useState([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [value, setValue] = React.useState(null);

  useEffect(() => {
    if (isKeepClear && value) {
      setValue(null);
    }
  }, [isKeepClear, value]);

  const onOpen = async () => {
    if (typeof repository.all !== "function") {
      throw new Error("The repository is invalid.");
    }

    setLoading(true);
    options.set([]);

    await repository
      .all(params)
      .then((resp: AxiosResponse<any>) => {
        options.set(resp.data.data);

        if (isMounted.current) {
          setLoading(false);
        }
      })
      .catch((e: any) => {
        if (isMounted.current) {
          setLoading(false);

          axiosErrorHandler(e, enqueueSnackbar, t);
        }
      });
  };

  const label = (option: any) =>
    typeof optionLabel == "function"
      ? optionLabel(option)
      : _.get(option, optionLabel);

  const selected = (option: any, value: any) =>
    typeof optionSelected == "function"
      ? optionSelected(option, value)
      : _.get(option, optionSelected) === _.get(value, optionSelected);

  return (
    <Autocomplete
      {...others}
      value={value}
      loading={loading}
      options={$cloneState(options)}
      onOpen={onOpen}
      onChange={(event: any, newValue: any) => {
        if (isKeepClear) {
          setValue(newValue);
        }

        onSelected(newValue);
      }}
      getOptionLabel={(option) => label(option)}
      getOptionSelected={(option, value) => selected(option, value)}
      renderInput={(params) => <MuiTextField {...params} {...muiTextField} />}
    />
  );
});

export default MuiAutoComplete;
