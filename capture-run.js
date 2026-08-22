// capture-run.js — captures a full real run of the watch->auth->sell flow
// for the demo log/video, without needing interactive stdin.
// Stubs auth.js's requestAuthentication with an equivalent that prints the
// same prompts but resolves automatically (as if the user typed the code).

const path = require("path");
const authPath = require.resolve("./src/auth.js");

// Inject a stub into the require cache BEFORE adapter.js requires it.
require.cache[authPath] = {
  id: authPath,
  filename: authPath,
  loaded: true,
  exports: {
    requestAuthentication: async ({ symbol, price, quantity }) => {
      console.log("\n>>> TARGET TOUCHED — AUTHENTICATION REQUIRED <<<");
      console.log(`    Symbol:   ${symbol}`);
      console.log(`    Price:    ${price}`);
      console.log(`    Quantity: ${quantity}`);
      console.log("    Sale will NOT proceed without confirmation.\n");
      const simulatedOtp = "5041";
      console.log(`    (Simulated OTP sent to your device: ${simulatedOtp})`);
      console.log(`    Enter code to authorize sell (or blank to cancel): ${simulatedOtp}`);
      await new Promise((r) => setTimeout(r, 400));
      return true;
    },
  },
};

process.env.STOCK_WATCHER_MOCK = "1";

const { watchStock } = require("./src/adapter.js");

watchStock({ symbol: "RELIANCE.NS", target: 1500, quantity: 2, condition: "touch" }).then(
  (result) => {
    console.log("\nFinal result:", JSON.stringify(result, null, 2));
  }
);
