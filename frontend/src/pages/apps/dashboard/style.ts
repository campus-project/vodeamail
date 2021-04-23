import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  cardSummaryContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gridGap: theme.spacing(3),

    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "repeat(1, 1fr)",

      "& .full-width": {
        gridColumn: "unset !important",
      },
    },

    "& .full-width": {
      gridColumn: "1 / span 2",
    },
  },

  cardSummaryItem: {
    display: "flex",
    flexDirection: "row",
    padding: theme.spacing(1.5),

    "& .card-summary-icon-box": {
      display: "grid",
      placeItems: "center",
      color: "white",
      fontSize: theme.spacing(3),
      backgroundColor: theme.palette.primary.main,
      borderRadius: theme.spacing(1),
      padding: theme.spacing(2),
      marginRight: theme.spacing(1.5),
    },

    "& .card-summary-description-box": {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: "100%",

      "& .percentage": {
        marginTop: "auto",
        color: theme.palette.primary.main,
      },
    },

    "&.danger": {
      "& .card-summary-icon-box": {
        backgroundColor: theme.palette.error.main,
      },

      "& .percentage": {
        marginTop: "auto",
        color: theme.palette.error.main,
      },
    },
  },

  summaryTable: {
    "& td, th": {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
  },
}));

export default useStyles;
