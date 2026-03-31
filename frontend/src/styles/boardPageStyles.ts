import type { SxProps, Theme } from "@mui/material/styles";

export const boardPageOuterSx: SxProps<Theme> = {
  minHeight: "100vh",
  padding: { xs: 2, md: 3 },
  boxSizing: "border-box",
  overflowX: "auto",
};

export const boardPageContainerSx: SxProps<Theme> = {
  width: "min(1240px, 100%)",
  minHeight: "calc(100vh - 48px)",
  margin: "0 auto",
  padding: { xs: 2, md: 3 },
  borderRadius: 3,
  backgroundColor: "rgba(255, 255, 255, 0.14)",
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  boxSizing: "border-box",
};

export const boardPageTitleSx: SxProps<Theme> = {
  color: "white",
  mb: 4,
  fontWeight: "bold",
};

export const boardColumnsRowSx: SxProps<Theme> = {
  display: "flex",
  gap: 3,
  justifyContent: "center",
  alignItems: "flex-start",
  overflowX: "auto",
  pb: 2,
};
