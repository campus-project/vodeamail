import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  status: {
    display: "inline-block",
    padding: `0 ${theme.spacing(1)}px`,
  },
  campaignStepper: {
    boxShadow: "0px 2px 8px #0000001A;",
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    position: "relative",
    borderRadius: theme.spacing(0.8),

    "& .icon": {
      height: 37,
      width: 37,
      textAlign: "center",
      backgroundColor: "#eaeaf0",
      color: "#606060",
      padding: theme.spacing(1),
      margin: theme.spacing(-2),
      marginRight: theme.spacing(1),
      borderRadius: theme.spacing(0.5),
      lineHeight: "unset",
    },
  },
  campaignStepperActive: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: "white !important",
  },
  campaignStepperCompleted: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: "white !important",
  },

  templateItemGroup: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gridGap: theme.spacing(2),

    "& .MuiFormControlLabel-root": {
      position: "relative",
      borderRadius: theme.shape.borderRadius,
      gridColumn: "auto/span 4",
      border: "1px solid black",
      marginLeft: "unset",
      marginRight: "unset",

      "& img": {
        height: theme.spacing(25),
        width: "100%",
        objectFit: "contain",
      },

      "& .MuiIconButton-root": {
        position: "absolute",
        right: 0,
        top: 0,
      },
    },
  },

  templateCreate: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "100%",
    marginLeft: theme.spacing(5),

    [theme.breakpoints.down("sm")]: {
      width: "100%",
      alignItems: "center",
      marginLeft: "unset",
    },
  },
}));

export default useStyles;
