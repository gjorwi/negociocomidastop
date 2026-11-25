const PRICE_KEYS = ["unique", "small", "medium", "large"];
const SIZE_LABELS = [
  ["small", "P"],
  ["medium", "M"],
  ["large", "G"],
];

export function getProductPrices(product) {
  const source = product?.prices || {};
  const prices = {};
  let hasStoredPrices = false;

  for (const key of PRICE_KEYS) {
    const value = Number(source[key]);
    if (Number.isFinite(value) && value > 0) {
      prices[key] = value;
      hasStoredPrices = true;
    } else {
      prices[key] = null;
    }
  }

  if (!hasStoredPrices) {
    const legacyPrice = Number(product?.price);
    prices.unique =
      Number.isFinite(legacyPrice) && legacyPrice > 0 ? legacyPrice : null;
  }

  return prices;
}

export function hasSizePrices(prices) {
  return SIZE_LABELS.some(([key]) => typeof prices?.[key] === "number");
}

export function formatMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : "";
}

function compactMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  return `${Number.isInteger(amount) ? amount : amount.toFixed(2)}$`;
}

export function formatPriceSummary(product) {
  const prices = getProductPrices(product);

  if (hasSizePrices(prices)) {
    return SIZE_LABELS.filter(([key]) => typeof prices[key] === "number")
      .map(([key, label]) => `${label}:${compactMoney(prices[key])}`)
      .join(" ");
  }

  return typeof prices.unique === "number" ? formatMoney(prices.unique) : "";
}
