import type { SxProps, Theme } from "@mui/material/styles";

export const dialogTitleSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 2,
  px: 2.5,
  py: 1.5,
  position: "relative",
};

export const avatarSx: SxProps<Theme> = (theme) => ({
  bgcolor: theme.palette.primary.main,
  width: 40,
  height: 40,
});

export const dialogContentSx: SxProps<Theme> = {
  py: 2,
};

export const listItemSx: SxProps<Theme> = {
  py: 1.25,
};

export const dialogActionsSx: SxProps<Theme> = {
  px: 3,
  pb: 2,
};

export const captionSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: "0.85rem",
};
