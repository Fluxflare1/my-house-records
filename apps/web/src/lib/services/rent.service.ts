import { getAdapters } from "../adapters";
import { Rent } from "../types/rent";

export class RentService {
  async generate(rent: Rent) {
    const { sheets } = getAdapters();
    await sheets.appendRow("rents", Object.values(rent));
  }
}
