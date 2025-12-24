export function filterByOccupancyPeriod<T extends { occupancy_id: string }>(
  records: T[],
  allowedOccupancies: string[]
): T[] {
  return records.filter(r => allowedOccupancies.includes(r.occupancy_id));
}
