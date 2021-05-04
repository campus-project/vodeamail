import React from "react";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { BoxProps } from "@material-ui/core/Box/Box";

export interface MuiCardBodyProps extends BoxProps {}

const MuiCardBody = withStyles((theme: Theme) =>
  createStyles({
    root: {
      marginBottom: `-${theme.spacing(2)}px`,
      padding: `${theme.spacing(3)}px ${theme.spacing(3)}px`,
    },
  })
)((props: MuiCardBodyProps) => <Box {...props} />);

export default MuiCardBody;
