import { getAdapters } from "../adapters";
import { Property } from "../types/property";

export class PropertyService {
  async create(property: Property) {
    const { sheets } = getAdapters();
    await sheets.appendRow("properties", Object.values(property));
  }
}
