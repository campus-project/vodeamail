import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  status: {
    display: "inline-block",
    padding: `0 ${theme.spacing(1)}px`,
  },
  containerEmailWrapper: {
    height: "100vh",

    "& .container-control-button": {
      position: "absolute",
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
