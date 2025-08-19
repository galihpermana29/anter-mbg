import dayjs from "dayjs";

export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  return dayjs(dateString).format("DD MMM YYYY HH:mm");
}

export function formatDateOnly(dateString: string): string {
  if (!dateString) return "-";
  return dayjs(dateString).format("DD MMM YYYY");
}

export function formatTime(dateString: string): string {
  if (!dateString) return "-";
  return dayjs(dateString).format("HH:mm");
}
