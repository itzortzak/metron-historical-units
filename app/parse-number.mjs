/**
 * Parse Greek-formatted and common international decimal input.
 * Dots are treated as Greek thousands separators when they form groups of
 * three, while a comma is preferred as the decimal separator.
 *
 * @param {string} raw
 * @returns {number | null}
 */
export function parseLocalizedNumber(raw) {
  let normalized = raw
    .trim()
    .replace(/[\s\u00a0\u202f]/g, "")
    .replace("−", "-");

  if (!normalized) return null;

  const commaCount = (normalized.match(/,/g) ?? []).length;
  const dotCount = (normalized.match(/\./g) ?? []).length;

  if (commaCount && dotCount) {
    if (normalized.lastIndexOf(",") > normalized.lastIndexOf(".")) {
      if (commaCount !== 1) return null;
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      if (dotCount !== 1) return null;
      normalized = normalized.replace(/,/g, "");
    }
  } else if (commaCount) {
    if (commaCount === 1) {
      normalized = normalized.replace(",", ".");
    } else if (/^[+-]?\d{1,3}(?:,\d{3})+$/.test(normalized)) {
      normalized = normalized.replace(/,/g, "");
    } else {
      return null;
    }
  } else if (dotCount) {
    const looksGreekGrouped = /^[+-]?[1-9]\d{0,2}(?:\.\d{3})+$/.test(normalized);
    if (looksGreekGrouped) {
      normalized = normalized.replace(/\./g, "");
    } else if (dotCount !== 1) {
      return null;
    }
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
