/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { CssBaseline, ThemeProvider, Toolbar } from "@material-ui/core";
import { SnackbarProvider } from "notistack";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { useDispatch, useSelector } from "react-redux";
import { useJwtService } from "../../utilities/hooks";
import Loading from "../../components/ui/Loading";
import Header from "../../components/apps/header";
import Sidebar from "../../components/apps/sidebar";
import { initMenu } from "../../store/actions/setting";
import clsx from "clsx";
import useStyles from "./style";
import theme from "./theme";
import { useLocation } from "react-router";
import { setLastLocation } from "../../store/actions";
import { ConfirmProvider } from "material-ui-confirm";

const LayoutApps: React.FC<any> = () => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const location = useLocation();

  const { isOnFetchingUser } = useJwtService();
  const { isLogged, isOpen } = useSelector(({ vodea, setting }: any) => {
    return {
      isLogged: vodea.auth.isLogged,
      isOpen: setting.sidebar.isOpen,
    };
  });

  useEffect(() => {
    dispatch(initMenu([]));
  }, []);

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
            <Header />
            <Sidebar />
            <main
              className={clsx(classes.content, {
                [classes.contentShift]: !isOpen,
              })}
            >
              <Toolbar />
              <div className={classes.contentInside}>
                <Outlet />
              </div>
            </main>
          </ConfirmProvider>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
};

export default LayoutApps;
