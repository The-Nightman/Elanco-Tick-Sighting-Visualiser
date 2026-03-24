/**
 * Generates a random alphanumeric ID for a sighting report.
 *
 * @param {number} startPos - The starting index for ID generation. Defaults to 0. If greater than 0, generates a substring starting at that position.
 *
 * @returns {string} A 20-character random string composed of uppercase letters, lowercase letters, and digits.
 *
 * @example
 * const sightingId = generateSightingId() // "aZ3x9B1cD4eF6gH7jK8G";
 *
 * const partialId = generateSightingId(5) // "9B1cD4eF6gH7jK8";
 * const completeId = "E7fOH" + partialId; // "E7fOH9B1cD4eF6gH7jK8"
 */
export const generateSightingId = (startPos: number = 0): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let autoId = "";

  for (let i = startPos; i < 20; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return autoId;
};
