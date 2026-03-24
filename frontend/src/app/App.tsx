import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../app/theme";
import BoardPage from "../pages/BoardPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BoardPage />
    </ThemeProvider>
  );
}

export default App;
