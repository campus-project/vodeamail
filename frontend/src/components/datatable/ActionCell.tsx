import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { BoxProps } from "@material-ui/core/Box/Box";

export interface MuiCardProps extends BoxProps {}

const ActionCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      justifyContent: "flex-end",
      paddingRight: theme.spacing(1),

      [theme.breakpoints.down("xs")]: {
        justifyContent: "center",
        paddingRight: "unset",
        marginTop: `-${theme.spacing(2)}px`,
      },
    },
  })
)((props: MuiCardProps) => <Box {...props} />);

export default ActionCell;
