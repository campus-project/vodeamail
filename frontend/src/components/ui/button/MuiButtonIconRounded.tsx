import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { IconButton, IconButtonProps } from "@material-ui/core";

export interface MuiButtonIconRoundedProps extends IconButtonProps {}

const MuiButtonIconRounded = withStyles((theme: Theme) =>
  createStyles({
    root: {
      border: `2px solid ${theme.palette.text.primary}`,
      borderRadius: "50%",
      height: 30,
      width: 30,
      padding: theme.spacing(0.5),
    },
  })
)((props: MuiButtonIconRoundedProps) => <IconButton {...props} />);

export default MuiButtonIconRounded;
