import "date-fns";
import React from "react";
import DateFnsUtils from "@date-io/date-fns";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";

export interface MuiDatePickerProps extends KeyboardDatePickerProps {}

const MuiDatePicker = withStyles((theme: Theme) =>
  createStyles({
    root: {},
  })
)((props: MuiDatePickerProps) => (
  <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <KeyboardDatePicker
      format="dd/MM/yyyy"
      fullWidth
      inputVariant="outlined"
      {...props}
    />
  </MuiPickersUtilsProvider>
));

export default MuiDatePicker;
