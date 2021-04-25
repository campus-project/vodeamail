import React from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import { useStyles } from "../style";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LaunchOutlined } from "@material-ui/icons";
import { profileUrl } from "../../../../utilities/helpers";

const Account: React.FC<any> = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { user } = useSelector(({ vodea }: any) => {
    return {
      user: vodea.auth.user,
    };
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <Avatar
          alt={user.name}
          src={user.photo_url}
          className={classes.avatar}
        />
      </IconButton>

      <Menu
        getContentAnchorEl={null}
        id="account-menu"
        classes={{
          paper: classes.menu,
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorEl={anchorEl}
      >
        <Box px={2} py={1} m={0} className={"profile-information"}>
          <Typography
            variant="subtitle1"
            gutterBottom
            className={"account-name"}
          >
            {user.name}
          </Typography>
          <Typography
            variant="caption"
            gutterBottom
            className={"account-email"}
          >
            {user.email}
          </Typography>
        </Box>

        <Divider variant="middle" />

        <Box py={1}>
          <MenuItem
            component={Link}
            href={profileUrl()}
            target={"_blank"}
            onClick={handleClose}
          >
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              style={{ width: "100%" }}
            >
              <Typography variant={"subtitle2"}>
                {t("common:profile")}
              </Typography>
              <LaunchOutlined />
            </Box>
          </MenuItem>

          <MenuItem
            component={NavLink}
            to={"/apps/preference"}
            onClick={handleClose}
          >
            <Typography variant={"subtitle2"}>{t("common:setting")}</Typography>
          </MenuItem>
        </Box>

        <Box px={2} py={1}>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            fullWidth
            component={NavLink}
            to={"/logout"}
          >
            {t("common:logout")}
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default Account;
