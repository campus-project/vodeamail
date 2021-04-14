import React from "react";
import { AppBar, Box, Toolbar } from "@material-ui/core";
import { useStyles } from "./style";
import Logo from "./part/Logo";
import Account from "./part/Account";

const Header: React.FC<any> = () => {
  const classes = useStyles();

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      className={classes.root}
    >
      <Toolbar>
        <Logo />

        <Box ml="auto" display={"flex"} justifyContent={"end"}>
          <Account />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
