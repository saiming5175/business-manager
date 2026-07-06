export function sumMoney(values: number[]): number {
  const cents = values.reduce((acc, v) => acc + Math.round(v * 100), 0);
  return cents / 100;
}

export function formatMYR(value: number): string {
  return `RM ${value.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
