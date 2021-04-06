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
import { initMenu } from "../../store/actions/setting";
import theme from "./theme";
import { ConfirmProvider } from "material-ui-confirm";

const LayoutApps: React.FC<any> = () => {
  const dispatch = useDispatch();

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
