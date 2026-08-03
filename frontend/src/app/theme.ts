import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  breakpoints: {
    // Adjusted mobile/tablet sizes per requested ranges.
    values: {
      xs: 0,
      sm: 480, // Mobile (Large) starts at 480
      md: 768, // Tablet starts at 768
      lg: 1200, // keep desktop start unchanged
      xl: 1536,
    },
  },
  palette: {
    mode: "light",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: "100%",
        },
        body: {
          height: "100%",
          margin: 0,
          backgroundImage: "url('/board-bg.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed", // optional, nice effect
        },
        "#root": {
          height: "100%",
        },
      },
    },
  },
});

export default theme;
