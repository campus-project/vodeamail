import React from "react";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { BoxProps } from "@material-ui/core/Box/Box";

export interface MuiCardProps extends BoxProps {}

const MuiCard = withStyles((theme: Theme) =>
  createStyles({
    root: {
      boxShadow: "0px 2px 8px #0000001A;",
      borderRadius: theme.spacing(1),
      padding: `${theme.spacing(2)}px 0px`,
    },
  })
)((props: MuiCardProps) => <Box {...props} />);

export default MuiCard;
