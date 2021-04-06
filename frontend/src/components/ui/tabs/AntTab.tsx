import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { Tab, TabProps } from "@material-ui/core";

export interface AntTabProps extends TabProps {
  label: string;
}

const AntTab = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: "none",
      minWidth: 72,
      fontWeight: theme.typography.fontWeightRegular,
      marginRight: theme.spacing(4),
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(","),
      "&:hover": {
        color: theme.palette.primary.main,
        opacity: 1,
      },
      "&$selected": {
        color: theme.palette.primary.main,
        fontWeight: theme.typography.fontWeightMedium,
      },
      "&:focus": {
        color: theme.palette.primary.main,
      },
    },
    selected: {},
  })
)((props: AntTabProps) => <Tab disableRipple {...props} />);

export default AntTab;
