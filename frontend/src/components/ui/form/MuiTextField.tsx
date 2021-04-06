import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { TextField, TextFieldProps } from "@material-ui/core";
export type { TextFieldProps as MuiTextFieldProps } from "@material-ui/core";

const MuiTextField = withStyles((theme: Theme) =>
  createStyles({
    root: {},
  })
)((props: TextFieldProps) => (
  <TextField variant="outlined" fullWidth {...props} />
));

export default MuiTextField;
