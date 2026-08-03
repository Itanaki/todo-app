import { ThemeProvider, CssBaseline, Box, CircularProgress } from "@mui/material";
import theme from "../app/theme";
import BoardPage from "../pages/BoardPage";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AuthScreen from "../components/auth/AuthScreen";
import { useSupabaseSession } from "../hooks/useSupabaseSession";

function App() {
  const { session, loading, signIn, signUp, signOut } = useSupabaseSession();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {loading ? (
          <Box
            sx={{
              minHeight: "100%",
              display: "grid",
              placeItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : session ? (
          <BoardPage
            accessToken={session.access_token}
            userLabel={session.user.email ?? session.user.id}
            onSignOut={() => void signOut()}
          />
        ) : (
          <AuthScreen onSignIn={signIn} onSignUp={signUp} />
        )}
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
