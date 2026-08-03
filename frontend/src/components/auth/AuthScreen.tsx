import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type AuthScreenProps = {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
};

const AuthScreen = ({ onSignIn, onSignUp }: AuthScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAction, setLoadingAction] = useState<"sign-in" | "sign-up" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: "sign-in" | "sign-up") => {
    setLoadingAction(action);
    setError(null);

    try {
      if (action === "sign-in") {
        await onSignIn(email, password);
      } else {
        await onSignUp(email, password);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Authentication failed");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Todo login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to keep your tasks private to this account.
              </Typography>
            </Box>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              fullWidth
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                onClick={() => void handleAction("sign-in")}
                disabled={loadingAction !== null}
                fullWidth
              >
                {loadingAction === "sign-in" ? "Signing in..." : "Sign in"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => void handleAction("sign-up")}
                disabled={loadingAction !== null}
                fullWidth
              >
                {loadingAction === "sign-up" ? "Creating..." : "Create account"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthScreen;