/* eslint-disable react-hooks/exhaustive-deps */

import React from "react";
import { Outlet } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { SnackbarProvider } from "notistack";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import theme from "./theme";
import { ConfirmProvider } from "material-ui-confirm";

const LayoutApps: React.FC<any> = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={2500}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          <ConfirmProvider>
            <Outlet />
          </ConfirmProvider>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
};

export default LayoutApps;
