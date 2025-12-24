import { getAdapters } from "../adapters";

export class RentService {
  async recordRent(data: any[]) {
    const { sheets } = getAdapters();
    await sheets.appendRow("rents", data);
  }
}
