import { fade, makeStyles } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";

const drawerWidth = 240;

export const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
  },
  drawerPaper: {
    width: drawerWidth,
    border: "unset",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  sidebar: {
    paddingTop: theme.spacing(2),

    "& .nav-list": {
      margin: 0,
      padding: 0,
      listStyle: "none",

      "& .nav-item": {
        margin: `2px ${theme.spacing(1.5)}px`,

        "& a": {
          textDecoration: "none",
          color: theme.palette.text.primary,
        },

        "&.opened": {
          color: theme.palette.primary.main,
          borderRadius: theme.shape.borderRadius,

          "& .nav-dropdown": {
            height: "100%",
          },
        },

        "& .nav-link": {
          display: "flex",
          justifyContent: "start",
          position: "relative",
          cursor: "pointer",
          padding: `${theme.spacing(0.7)}px ${theme.spacing(1.5)}px`,
          background: "white",
          borderRadius: theme.shape.borderRadius,
          alignItems: "center",
          transition: "all 0.5s ease",

          "&:hover": {
            background: grey[200],
            color: theme.palette.primary.main,
          },

          "&.active": {
            background: fade(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          },
        },

        "& .nav-icon": {
          minWidth: 30,
        },

        "& .nav-dropdown": {
          height: 0,
          marginBottom: 0,
          overflow: "hidden",
        },

        "& .dropdown-list": {
          padding: 0,
          listStyle: "none",
          marginLeft: 10,
          paddingLeft: 30,

          "& .dropdown-link": {
            display: "flex",
            justifyContent: "start",
            position: "relative",
            cursor: "pointer",
            padding: `${theme.spacing(0.7)}px ${theme.spacing(1.5)}px`,
            borderRadius: theme.shape.borderRadius,
            transition: "all 0.5s ease",

            "&:hover": {
              background: grey[200],
              color: theme.palette.primary.main,
            },

            "&.active": {
              background: fade(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            },
          },
        },
      },
    },
  },
}));
