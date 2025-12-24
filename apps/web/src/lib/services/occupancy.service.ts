import { getAdapters } from "../adapters";
import { Occupancy } from "../types/occupancy";

export class OccupancyService {
  async bond(occupancy: Occupancy) {
    const { sheets } = getAdapters();
    await sheets.appendRow("occupancies", Object.values(occupancy));
  }

  async unbond(occupancy: Occupancy) {
    occupancy.status = "ended";
    occupancy.end_date = new Date().toISOString();
    const { sheets } = getAdapters();
    await sheets.appendRow("occupancies", Object.values(occupancy));
  }
}
