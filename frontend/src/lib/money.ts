export function toNumber(v: string | number): number {
  if (typeof v === "number") return v;
  return Number.parseFloat(v);
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
