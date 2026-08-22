/**
 * broker.js
 * Broker order placement — STUB ONLY.
 *
 * This does not connect to any real brokerage or move any real money.
 * It exists so the rest of the pipeline (watch → auth → sell) is
 * complete and demoable end-to-end.
 *
 * To go live, replace the body of placeSellOrder() with a real call to
 * your broker's official API, e.g.:
 *   - Zerodha Kite Connect: https://kite.trade/docs/connect/v3/
 *   - Upstox API:           https://upstox.com/developer/api-documentation
 *   - Groww API:            (check current Groww developer docs)
 *
 * Each of those needs its own registered app, API key/secret, and its
 * own login + TOTP flow — none of that is included here since it's
 * account-specific and security-sensitive. Store any real credentials
 * in a local .env file, never in this repo.
 */

async function placeSellOrder({ symbol, price, quantity }) {
  // TODO: wire real broker API here. Example shape for most broker SDKs:
  //
  //   const order = await brokerClient.placeOrder({
  //     symbol,
  //     transaction_type: "SELL",
  //     quantity,
  //     order_type: "MARKET",
  //   });
  //   return { status: "PLACED", orderId: order.id };

  const simulatedOrderId = `SIM-${Date.now()}`;

  return {
    status: "SIMULATED_ONLY",
    orderId: simulatedOrderId,
    symbol,
    price,
    quantity,
    note: "No real order was placed. Wire a real broker API in broker.js to go live.",
  };
}

module.exports = { placeSellOrder };
