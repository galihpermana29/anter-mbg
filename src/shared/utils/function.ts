export function parseStringStats(stats: string): string {
  // parse to thousand format with comma as separator
  const number = parseFloat(stats);
  
  // Check if the parsing resulted in a valid number
  if (isNaN(number)) {
    return stats; // Return original string if not a valid number
  }
  
  // Format number with comma separators
  return number.toLocaleString('en-US');
}
