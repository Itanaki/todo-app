import dayjs from "dayjs";

export const getDueStyle = (dueDate: string) => {
  const today = dayjs().startOf("day");
  const due = dayjs(dueDate);

  if (due.isBefore(today)) {
    return {
      bg: "#ffebee",
      text: "#c62828",
      label: "Overdue",
    };
  }

  if (due.diff(today, "day") <= 1) {
    return {
      bg: "#fff3e0",
      text: "#ef6c00",
      label: "Due soon",
    };
  }

  return {
    bg: "#e3f2fd",
    text: "#1565c0",
    label: "Upcoming",
  };
};
