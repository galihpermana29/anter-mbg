import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// Extend dayjs with UTC plugin
dayjs.extend(utc);

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

/**
 * Format departure time from UTC to local time
 * @param time Time string in HH:MM format (UTC)
 * @returns Formatted time string in local timezone
 */
export function formatDepartureTime(time: string): string {
  if (!time || time === "00:00") return "-";
  
  // Parse the time string (assuming HH:MM format)
  const [hours, minutes] = time.split(":").map(Number);
  
  // Create a dayjs object with today's date and the given time in UTC
  // Then convert to local time
  const localTime = dayjs.utc().hour(hours).minute(minutes).local();
  
  // Format the time in local timezone
  return localTime.format("HH:mm");
}
