export const MIN_RATINGS_FOR_RANKING = 5;

export function getAdjustedProductScore(product) {
  return typeof product?.score === "number" ? product.score : null;
}

export function formatScore(score) {
  return typeof score === "number" ? score.toFixed(1).replace(".", ",") : "—";
}
