import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import React from "react";

export interface MuiDatePickerProps extends KeyboardDatePickerProps {}

const MuiDatePicker = withStyles((theme: Theme) =>
  createStyles({
    root: {},
  })
)((props: MuiDatePickerProps) => (
  <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <KeyboardDatePicker
      format="dd/MM/yyyy"
      margin={"normal"}
      fullWidth
      inputVariant="outlined"
      {...props}
    />
  </MuiPickersUtilsProvider>
));

export default MuiDatePicker;
