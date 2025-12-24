"use server";

import { ReferenceDataService } from "@/lib/services/reference-data.service";

export async function getReferenceData() {
  const svc = new ReferenceDataService();
  const [properties, apartmentTypes, apartments, tenants, occupancies] =
    await Promise.all([
      svc.properties(),
      svc.apartmentTypes(),
      svc.apartments(),
      svc.tenants(),
      svc.activeOccupancies(),
    ]);

  return { properties, apartmentTypes, apartments, tenants, occupancies };
}
