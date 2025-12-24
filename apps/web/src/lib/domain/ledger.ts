export interface LedgerItem {
  id: string;
  expected: number;
  applied: number;
}

export function calculateBalance(items: LedgerItem[]) {
  const expected = items.reduce((s, i) => s + i.expected, 0);
  const applied = items.reduce((s, i) => s + i.applied, 0);
  return {
    expected,
    applied,
    balance: expected - applied
  };
}
