import type { SxProps, Theme } from "@mui/material/styles";

export const getBoardColumnContainerSx = (isOver: boolean): SxProps<Theme> => ({
  boxShadow: isOver
    ? "0 4px 12px rgba(0, 121, 191, 0.3)"
    : "0 2px 8px rgba(0, 0, 0, 0.1)",
  transition: "all 0.2s ease",
  flexShrink: 0,
  minHeight: 30,
  maxHeight: "75vh",
  display: "flex",
  flexDirection: "column",
});

export const boardColumnHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  mb: 2,
};

export const boardColumnTitleSx: SxProps<Theme> = {
  color: "#172b4d",
};

export const boardColumnRenameButtonSx: SxProps<Theme> = {
  opacity: 0.7,
};

export const boardColumnTaskListSx: SxProps<Theme> = {
  flex: 1,
  overflowY: "auto",
  mb: 1,
  scrollbarGutter: "stable overlay",
};

export const boardColumnAddButtonSx: SxProps<Theme> = {
  justifyContent: "flex-start",
  mt: "auto",
  backgroundColor: "rgba(9, 30, 66, 0.04)",
  color: "#172b4d",
  textTransform: "none",
  fontWeight: 500,
  "&:hover": {
    backgroundColor: "rgba(9, 30, 66, 0.08)",
  },
};
