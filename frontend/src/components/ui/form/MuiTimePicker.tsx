import "date-fns";
import React from "react";
import DateFnsUtils from "@date-io/date-fns";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import {
  KeyboardTimePicker,
  KeyboardTimePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";

export interface MuiTimePickerProps extends KeyboardTimePickerProps {}

const MuiTimePicker = withStyles((theme: Theme) =>
  createStyles({
    root: {},
  })
)((props: MuiTimePickerProps) => (
  <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <KeyboardTimePicker
      margin={"normal"}
      fullWidth
      inputVariant="outlined"
      ampm={false}
      {...props}
    />
  </MuiPickersUtilsProvider>
));

export default MuiTimePicker;
