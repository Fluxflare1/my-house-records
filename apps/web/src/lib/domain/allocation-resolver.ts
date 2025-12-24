export function resolveAllocations<
  T extends { [key: string]: any },
  A extends { amount_applied: number }
>(
  records: T[],
  allocations: A[],
  recordKey: keyof T,
  allocationKey: keyof A
) {
  const map = new Map<string, number>();

  for (const alloc of allocations) {
    const id = alloc[allocationKey];
    if (!id) continue;
    map.set(id, (map.get(id) ?? 0) + alloc.amount_applied);
  }

  return records.map(r => ({
    ...r,
    applied_amount: map.get(r[recordKey]) ?? 0
  }));
}
