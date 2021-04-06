import React from "react";
import { Box, Hidden, Toolbar } from "@material-ui/core";
import LogoFull from "../../../LogoFull";

const LogoSidebar: React.FC<any> = () => {
  return (
    <>
      <Hidden only={["xs", "sm"]}>
        <Toolbar />
      </Hidden>
      <Hidden mdUp>
        <Box display={"flex"} alignItems={"center"} p={2}>
          <LogoFull />
        </Box>
      </Hidden>
    </>
  );
};

export default LogoSidebar;
