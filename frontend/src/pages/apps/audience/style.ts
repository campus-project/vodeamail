import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  status: {
    display: "inline-block !important",
    padding: `0 ${theme.spacing(1)}px !important`,
  },
}));

export default useStyles;
