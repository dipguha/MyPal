/** MyPal is a UK product — currency is always GBP, locale en-GB. */

const FORMATTER = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function formatGBP(pounds: number): string {
  return FORMATTER.format(pounds);
}

export function formatGBPFromPennies(pennies: number): string {
  return FORMATTER.format(pennies / 100);
}
