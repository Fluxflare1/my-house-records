"use server";

import { StatementService } from "@/lib/services/statement.service";

export async function getApartmentStatement(apartmentId: string) {
  const svc = new StatementService();
  return svc.apartmentStatement(apartmentId);
}

export async function getTenantStatement(tenantId: string) {
  const svc = new StatementService();
  return svc.tenantStatement(tenantId);
}
