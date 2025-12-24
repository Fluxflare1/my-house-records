import { getAdapters } from "../adapters";
import { ApartmentType } from "../types/apartment-type";

export class ApartmentTypeService {
  async create(type: ApartmentType) {
    const { sheets } = getAdapters();
    await sheets.appendRow("apartmentTypes", Object.values(type));
  }
}
