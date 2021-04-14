import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  root: {
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: "1px -2px 21px 0 rgb(93 130 170 / 21%)",
  },

  menuButton: {
    marginRight: theme.spacing(2),

    [theme.breakpoints.down("sm")]: {
      marginRight: "unset",
    },
  },

  //account component
  avatar: {
    width: 32,
    height: 32,
  },
  menu: {
    marginTop: theme.spacing(1),
    width: 220,
    borderRadius: theme.spacing(1),
    boxShadow: "0 9px 21px 0 rgb(93 130 170 / 21%)",

    "& a": {
      color: theme.palette.text.primary,
      textDecoration: "none",
      ":hover": {
        textDecoration: "none",
      },
    },

    "& a:hover": {
      textDecoration: "none",
    },

    "& .profile-information": {
      outline: "none",

      "& .account-name": {
        margin: 0,
        fontWeight: 600,
      },

      "& .account-email": {
        margin: 0,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "inline-block",
        width: 190,
        color: "rgb(99, 115, 129)",
      },
    },
  },
}));
