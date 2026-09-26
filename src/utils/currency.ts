const OMR_SYMBOL = "ر.ع.";

const omrNumberFormatter = new Intl.NumberFormat("en-OM", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

export function formatOmaniRial(amount: number | null | undefined): string {
  const value = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  return `${OMR_SYMBOL} ${omrNumberFormatter.format(value)}`;
}
