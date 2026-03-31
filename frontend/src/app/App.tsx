import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../app/theme";
import BoardPage from "../pages/BoardPage";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BoardPage />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
