/**
 * adapter.js
 * WebCMD adapter: watches a stock price and, once the target condition
 * is met, requires authentication before placing a (stubbed) sell order.
 *
 * Command: webcmd stock watch --symbol <SYM> --target <price>
 *                              --quantity <n> --condition touch|drop
 */

const { getPrice, MOCK_MODE } = require("./priceSource");
const { requestAuthentication } = require("./auth");
const { placeSellOrder } = require("./broker");

const POLL_INTERVAL_MS = MOCK_MODE ? 700 : 15000; // faster loop for demos
const MAX_TICKS = 40; // safety cap so a real run doesn't poll forever

function conditionMet(condition, price, target) {
  if (condition === "drop") return price <= target;
  return price >= target; // default: "touch"
}

/**
 * @param {{symbol: string, target: number, quantity?: number, condition?: string}} args
 */
async function watchStock(args) {
  const { symbol, target, quantity = 1, condition = "touch" } = args;

  if (!symbol || target === undefined) {
    return { error: "MISSING_ARGS", message: "--symbol and --target are required" };
  }

  console.log(`Watching ${symbol} for price to ${condition} ${target}...`);
  if (MOCK_MODE) {
    console.log("(MOCK_MODE active — using simulated price ramp, not live market data)\n");
  }

  for (let tick = 0; tick < MAX_TICKS; tick++) {
    let price;
    try {
      price = await getPrice(symbol, target);
    } catch (err) {
      console.log(`  [tick ${tick}] price fetch failed: ${err.message}`);
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    console.log(`  [tick ${tick}] ${symbol} = ${price}`);

    if (conditionMet(condition, price, target)) {
      const authorized = await requestAuthentication({ symbol, price, quantity });

      if (!authorized) {
        console.log("\nAuthentication declined or incorrect — sell cancelled.");
        return {
          status: "CANCELLED",
          reason: "AUTH_FAILED",
          symbol,
          triggerPrice: price,
        };
      }

      console.log("\nAuthenticated. Placing sell order...");
      const order = await placeSellOrder({ symbol, price, quantity });
      console.log("Order result:", JSON.stringify(order, null, 2));

      return {
        status: "SOLD",
        symbol,
        triggerPrice: price,
        quantity,
        order,
      };
    }

    await sleep(POLL_INTERVAL_MS);
  }

  return { status: "TIMEOUT", message: `Target not reached within ${MAX_TICKS} ticks` };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { watchStock };

// --- Standalone CLI runner ---
// Usage: node src/adapter.js --symbol RELIANCE.NS --target 1500 --quantity 1
// Demo mode: STOCK_WATCHER_MOCK=1 node src/adapter.js --symbol RELIANCE.NS --target 1500
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : fallback;
  };

  const symbol = getArg("--symbol", "RELIANCE.NS");
  const target = parseFloat(getArg("--target", "1500"));
  const quantity = parseInt(getArg("--quantity", "1"), 10);
  const condition = getArg("--condition", "touch");

  watchStock({ symbol, target, quantity, condition }).then((result) => {
    console.log("\nFinal result:", JSON.stringify(result, null, 2));
  });
}
