const dayMap: Record<string, string> = {
  monday: "senin",
  tuesday: "selasa",
  wednesday: "rabu",
  thursday: "kamis",
  friday: "jumat",
  saturday: "sabtu",
  sunday: "minggu",
  random: "random",
};

export function convertDay(day: string): string {
  const lower = day.toLowerCase();

  // English → Indonesian
  if (dayMap[lower]) return dayMap[lower];

  // Indonesian → English
  const found = Object.entries(dayMap).find(([, indo]) => indo === lower);
  if (found) return found[0];

  throw new Error(`Unknown day: ${day}`);
}
