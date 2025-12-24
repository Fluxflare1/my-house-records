import { getAdapters } from "../adapters";

export class OccupancyService {
  async recordOccupancy(data: any[]) {
    const { sheets } = getAdapters();
    await sheets.appendRow("occupancies", data);
  }
}
