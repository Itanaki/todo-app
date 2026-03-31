import type { SxProps, Theme } from "@mui/material/styles";

type DueTone = {
  bg: string;
  text: string;
};

export const getBoardCardContainerSx: SxProps<Theme> = {
  mb: 1.5,
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.12)",
  backgroundColor: "white",
  cursor: "grab",
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  },
  borderRadius: "6px",
  border: "none",
};

export const getBoardCardPresenceSx = (presence?: {
  name: string;
  color: string;
}): SxProps<Theme> => ({
  border: presence ? `2px solid ${presence.color}` : "1px solid #e0e0e0",
});

export const getBoardCardSx: SxProps<Theme> = {
  padding: 2,
  "&:last-child": { paddingBottom: 2 },
  backgroundColor: "white",
};

export const getBoardCardTitleSx: SxProps<Theme> = {
  color: "#172b4d",
};

export const getBoardCardDescSx: SxProps<Theme> = {
  color: "#626f86",
};

const boardCardDueDateBaseSx: SxProps<Theme> = {
  mt: 1,
  display: "inline-flex",
  alignItems: "center",
  px: 1,
  py: 0.25,
  borderRadius: 1,
  fontSize: "0.75rem",
  fontWeight: 600,
};

export const getBoardCardDueDateSx = ({
  bg,
  text,
}: DueTone): SxProps<Theme> => ({
  ...boardCardDueDateBaseSx,
  backgroundColor: bg,
  color: text,
});

export const getBoardCardBottomSx: SxProps<Theme> = {
  padding: "8px 16px",
  "&:last-child": { paddingBottom: "8px" },
};
