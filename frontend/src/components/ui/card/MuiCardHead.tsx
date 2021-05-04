import React from "react";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { BoxProps } from "@material-ui/core/Box/Box";

export interface MuiCardHeadProps extends BoxProps {
  borderless?: boolean | number;
}

const MuiCardHead = withStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: `-${theme.spacing(2)}px`,
      borderBottom: `1px solid #EAEAEA`,
      padding: `${theme.spacing(1)}px ${theme.spacing(3)}px`,
    },
  })
)((props: MuiCardHeadProps) => (
  <Box {...props} style={props.borderless ? { borderBottom: "unset" } : {}} />
));

export default MuiCardHead;
