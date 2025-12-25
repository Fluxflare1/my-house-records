export function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export type Summary = {
  rentExpected: number;
  rentApplied: number;
  rentBalance: number;
  billExpected: number;
  billApplied: number;
  billBalance: number;
  paymentsTotal: number;
};

export function computeSummary(data: any): Summary {
  const allocs = data?.allocations || [];
  const rentAppliedMap = new Map<string, number>();
  const billAppliedMap = new Map<string, number>();

  for (const a of allocs) {
    const amt = n(a.amount_applied);
    const rid = String(a.rent_id || "");
    const bid = String(a.bill_id || "");
    if (rid) rentAppliedMap.set(rid, (rentAppliedMap.get(rid) ?? 0) + amt);
    if (bid) billAppliedMap.set(bid, (billAppliedMap.get(bid) ?? 0) + amt);
  }

  const rents = (data?.rents || []).map((r: any) => {
    const expected = n(r.expected_amount);
    const applied = rentAppliedMap.get(String(r.rent_id)) ?? 0;
    return { expected, applied, balance: expected - applied };
  });

  const bills = (data?.bills || []).map((b: any) => {
    const expected = n(b.expected_amount);
    const applied = billAppliedMap.get(String(b.bill_id)) ?? 0;
    return { expected, applied, balance: expected - applied };
  });

  const rentExpected = rents.reduce((s, x) => s + x.expected, 0);
  const rentApplied = rents.reduce((s, x) => s + x.applied, 0);
  const rentBalance = rents.reduce((s, x) => s + x.balance, 0);

  const billExpected = bills.reduce((s, x) => s + x.expected, 0);
  const billApplied = bills.reduce((s, x) => s + x.applied, 0);
  const billBalance = bills.reduce((s, x) => s + x.balance, 0);

  const paymentsTotal = (data?.payments || []).reduce((s: number, p: any) => s + n(p.amount), 0);

  return { rentExpected, rentApplied, rentBalance, billExpected, billApplied, billBalance, paymentsTotal };
}
