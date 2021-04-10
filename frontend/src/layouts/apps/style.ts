import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  content: {
    height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
    flexGrow: 1,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 240,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
      marginLeft: 0,
    },
  },
  contentShift: {
    [theme.breakpoints.up("sm")]: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
  },
  contentInside: {
    padding: theme.spacing(3),
    height: "100%",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0),
    },
  },
}));

export default useStyles;
