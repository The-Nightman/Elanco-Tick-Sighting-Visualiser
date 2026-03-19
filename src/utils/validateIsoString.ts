/**
 * Validates and corrects an ISO 8601 datetime string by ensuring time components are within valid ranges.
 *
 * @param {string} dateTimeString - An ISO 8601 formatted datetime string (e.g., "2024-01-15T25:65:75")
 * @returns {string} A corrected ISO 8601 datetime string with valid time components
 *
 * @remarks
 * This function currently only corrects the time components (hours, minutes, seconds) if they are out of their valid ranges.
 *
 * @example
 * validateIsoString("2024-01-15T25:65:75"); // "2024-01-15T05:05:05"
 * validateIsoString("2024-01-15T12:30:45"); // "2024-01-15T12:30:45"
 */
export const validateIsoString = (dateTimeString: string): string => {
  const [dateString, timeString] = dateTimeString.split("T");
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  let validatedTimeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  if (hours < 0 || hours > 23) {
    validatedTimeString = `0${hours.toString().slice(-1)}:${validatedTimeString.slice(3)}`;
  }
  if (minutes < 0 || minutes > 59) {
    validatedTimeString = `${validatedTimeString.slice(0, 3)}0${minutes.toString().slice(-1)}:${validatedTimeString.slice(6)}`;
  }
  if (seconds < 0 || seconds > 59) {
    validatedTimeString = `${validatedTimeString.slice(0, 6)}0${seconds.toString().slice(-1)}`;
  }

  return `${dateString}T${validatedTimeString}`;
};
