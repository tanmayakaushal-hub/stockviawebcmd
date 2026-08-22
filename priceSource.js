/**
 * priceSource.js
 * Pluggable live-price fetcher for the stock watcher.
 *
 * Real endpoint used: Yahoo Finance public chart API
 *   https://query1.finance.yahoo.com/v8/finance/chart/<SYMBOL>
 *   (no API key needed for basic quote data; unofficial but widely used)
 *
 * Alternative (India-specific): NSE India's public quote endpoint
 *   https://www.nseindia.com/api/quote-equity?symbol=<SYMBOL>
 *   (requires a browser-like session/cookie — NSE blocks plain requests
 *   without proper headers, which is exactly the kind of case WebCMD's
 *   INTERCEPT strategy is built for)
 *
 * MOCK_MODE: set to `true` to use a simulated price ramp instead of a real
 * network call. Used for demos / environments without internet access to
 * financial data providers. The real fetch path below is left intact so
 * flipping MOCK_MODE to false gives you real live prices.
 */

const MOCK_MODE = process.env.STOCK_WATCHER_MOCK === "1";

// --- Real price fetcher (Yahoo Finance public chart endpoint) ---
async function fetchRealPrice(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "stock-price-watcher-webcmd-adapter" },
  });

  if (!res.ok) {
    throw new Error(`Price fetch failed: HTTP ${res.status}`);
  }

  const data = await res.json();
  const result = data?.chart?.result?.[0];
  const price = result?.meta?.regularMarketPrice;

  if (typeof price !== "number") {
    throw new Error("Unexpected response shape from price provider");
  }

  return price;
}

// --- Mock price generator (for demos without live market access) ---
let mockTick = 0;
let mockBasePrice = null;

function fetchMockPrice(symbol, target) {
  // Ramps steadily toward the target over ~8 ticks, then holds at/above it.
  if (mockBasePrice === null) {
    mockBasePrice = target - 40; // start noticeably below target
  }
  mockTick += 1;
  const step = 5 + Math.random() * 3;
  mockBasePrice = Math.min(target + 2, mockBasePrice + step);
  return Number(mockBasePrice.toFixed(2));
}

/**
 * @param {string} symbol
 * @param {number} target - only used by the mock ramp, ignored for real fetch
 */
async function getPrice(symbol, target) {
  if (MOCK_MODE) {
    return fetchMockPrice(symbol, target);
  }
  return fetchRealPrice(symbol);
}

module.exports = { getPrice, MOCK_MODE };
