/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { SnackbarProvider } from "notistack";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { useDispatch, useSelector } from "react-redux";
import { useJwtService } from "../../utilities/hooks";
import Loading from "../../components/ui/Loading";
import { initMenu, setLastLocation } from "../../store/actions";
import theme from "./theme";
import { ConfirmProvider } from "material-ui-confirm";
import { useLocation } from "react-router";

const LayoutApps: React.FC<any> = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { isOnFetchingUser } = useJwtService();

  const { isLogged } = useSelector(({ vodea, setting }: any) => {
    return {
      isLogged: vodea.auth.isLogged,
      isOpen: setting.sidebar.isOpen,
    };
  });

  useEffect(() => {
    dispatch(initMenu([]));
  }, [false]);

  useEffect(() => {
    if (!isOnFetchingUser && !isLogged) {
      dispatch(setLastLocation(location.pathname + location.search));
    }
  }, [isOnFetchingUser, isLogged]);

  if (isOnFetchingUser) {
    return <Loading />;
  } else if (!isLogged) {
    return <Navigate to={"/auth"} />;
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
          <ConfirmProvider>
            <Outlet />
          </ConfirmProvider>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
};

export default LayoutApps;
