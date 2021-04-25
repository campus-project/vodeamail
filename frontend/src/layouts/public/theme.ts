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
    MuiPaper: {
      elevation1: {
        boxShadow: "0px 2px 8px #0000001a",
      },
    },
    MuiOutlinedInput: {
      root: {
        borderRadius: 8,
      },
    },
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
    MuiTableCell: {
      body: {
        borderBottom: "1px solid #f4f4f4",
      },
      footer: {
        border: "unset",
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
    error: {
      main: "#DB1D1D",
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
