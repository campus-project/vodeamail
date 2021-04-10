import { createMuiTheme } from "@material-ui/core";

export const theme = createMuiTheme({
  mixins: {
    toolbar: {
      minHeight: 55,
      "@media (min-width:600px)": {
        minHeight: 55,
      },
    },
  },
  overrides: {
    MuiMenuItem: {
      root: {
        fontSize: "0.8rem",
        "@media (max-width:600px)": {
          minHeight: 28,
        },
      },
    },
    MuiButton: {
      root: {
        padding: "8px 16px",
      },
    },
  },
  palette: {
    primary: {
      light: "#5c83ab",
      main: "#023E7D",
      dark: "#244669",
      contrastText: "#ffffff",
    },
    secondary: {
      light: "#5c83ab",
      main: "#346497",
      dark: "#244669",
    },
    text: {
      primary: "#383838",
    },
    background: {
      default: "#FFFFFF",
    },
  },
  typography: {
    h5: {
      fontWeight: 500,
    },
    button: {
      fontSize: "0.75rem",
      // textTransform: "none",
    },
  },
});

export default theme;
