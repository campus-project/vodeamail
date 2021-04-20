/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect } from "react";
import { Box, SwipeableDrawer, useTheme } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import {
  changeSidebarVariant,
  setSidebarClose,
  setSidebarOpen,
} from "../../../store/actions";
import { useIsMounted, useWindowSize } from "../../../utilities/hooks";
import { useStyles } from "./style";
import EmailUsageStatistic from "./part/EmailUsageStatistic";
import CreateCampaign from "./part/CreateCampaign";
import LogoSidebar from "./part/LogoSidebar";
import MenuSidebar from "./part/MenuSidebar";

const Sidebar: React.FC<any> = () => {
  const classes = useStyles();
  const theme = useTheme();
  const size = useWindowSize();
  const isMounted = useIsMounted();

  const dispatch = useDispatch();
  const { anchor, isOpen, variant, sidebarOpenKey } = useSelector(
    ({ setting }: any) => {
      return {
        anchor: setting.sidebar.anchor,
        isOpen: setting.sidebar.isOpen,
        variant: setting.sidebar.variant,
        sidebarOpenKey: setting.sidebar.sidebarOpenKey,
      };
    }
  );

  useEffect(() => {
    handleResize(size[0] <= theme.breakpoints.values.md);
  }, [size]);

  useEffect(() => {
    if (isMounted.current) {
      localStorage.setItem(sidebarOpenKey, isOpen ? "1" : "0");
    }
  }, [isOpen]);

  const handleResize = (isMobile: boolean) => {
    if (isOpen) {
      dispatch(setSidebarClose());
      dispatch(changeSidebarVariant(isMobile ? "temporary" : "persistent"));
      dispatch(setSidebarOpen());
    } else {
      dispatch(changeSidebarVariant(isMobile ? "temporary" : "persistent"));
    }
  };

  return (
    <SwipeableDrawer
      className={classes.drawer}
      classes={{ paper: classes.drawerPaper }}
      anchor={anchor}
      variant={variant}
      open={isOpen}
      onClose={() => dispatch(setSidebarClose())}
      onOpen={() => dispatch(setSidebarOpen())}
    >
      <Box>
        <LogoSidebar />
        <CreateCampaign />
        <MenuSidebar />
      </Box>

      <EmailUsageStatistic />
    </SwipeableDrawer>
  );
};

export default Sidebar;
