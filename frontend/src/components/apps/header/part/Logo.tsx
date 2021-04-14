import React from "react";
import { Hidden, IconButton, Link } from "@material-ui/core";
import { Menu } from "@material-ui/icons";
import { useStyles } from "../style";
import LogoFull from "../../../LogoFull";
import { useDispatch, useSelector } from "react-redux";
import {
  setSidebarClose,
  setSidebarOpen,
} from "../../../../store/actions/setting";
import { Link as LinkDom } from "react-router-dom";

const Logo: React.FC<{}> = () => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const { isOpen } = useSelector(({ setting }: any) => {
    return {
      isOpen: setting.sidebar.isOpen,
    };
  });

  return (
    <>
      <IconButton
        edge="start"
        className={classes.menuButton}
        color="inherit"
        aria-label="menu"
        onClick={() => dispatch(isOpen ? setSidebarClose() : setSidebarOpen())}
      >
        <Menu />
      </IconButton>

      <Hidden smDown>
        <Link component={LinkDom} to={"/apps/dashboard"}>
          <LogoFull />
        </Link>
      </Hidden>
    </>
  );
};

export default Logo;
