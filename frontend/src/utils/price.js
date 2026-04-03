/** Parse storefront strings like "39.99_USD" or "FREE_TO_PLAY" into USD number for checkout. */
export function parsePriceFromGame(priceStr) {
    if (priceStr == null) return 0;
    const s = String(priceStr);
    if (/free/i.test(s)) return 0;
    const m = s.match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
}
