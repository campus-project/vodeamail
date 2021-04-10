import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loading from "../../components/ui/Loading";
import { useJwtService } from "../../utilities/hooks";
import theme from "./theme";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { SnackbarProvider } from "notistack";

const LayoutAuth: React.FC<any> = () => {
  const { isOnFetchingUser } = useJwtService();
  const { isLogged, lastLocation } = useSelector(({ vodea }: any) => {
    return {
      isLogged: vodea.auth.isLogged,
      lastLocation: vodea.auth.lastLocation,
    };
  });

  if (isOnFetchingUser) {
    return <Loading />;
  } else if (isLogged) {
    return <Navigate to={lastLocation || "/apps/dashboard"} />;
  }

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
          <Outlet />
        </SnackbarProvider>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
};

export default LayoutAuth;
