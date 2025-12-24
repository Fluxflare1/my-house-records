import { getAdapters } from "../adapters";
import { Apartment } from "../types/apartment";

export class ApartmentService {
  async create(apartment: Apartment) {
    const { sheets } = getAdapters();
    await sheets.appendRow("apartments", Object.values(apartment));
  }
}
