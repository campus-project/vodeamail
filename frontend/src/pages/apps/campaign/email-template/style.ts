import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  containerEmailWrapper: {
    height: "100vh",

    "& .container-control-button": {
      position: "absolute",
      bottom: theme.spacing(1),
      right: 425 + theme.spacing(4),
    },

    "& .container-email-editor": {
      height: "100%",
      "& :first-child": {
        height: "100%",
      },
    },
  },
}));

export default useStyles;
