/**
 * auth.js
 * Authentication gate — runs the moment the watched price condition is
 * met, BEFORE any sell order is placed. Nothing in broker.js is ever
 * called without this returning true.
 *
 * This is a CLI-based simulation (type a confirmation code). Swap this
 * for your broker's real 2FA/TOTP verification before wiring broker.js
 * to a real account.
 */

const readline = require("readline");

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Prompts the user to confirm the trade with a simple code, simulating
 * an OTP/PIN step. Returns true only on exact match.
 */
async function requestAuthentication({ symbol, price, quantity }) {
  console.log("\n>>> TARGET TOUCHED — AUTHENTICATION REQUIRED <<<");
  console.log(`    Symbol:   ${symbol}`);
  console.log(`    Price:    ${price}`);
  console.log(`    Quantity: ${quantity}`);
  console.log("    Sale will NOT proceed without confirmation.\n");

  // In demo/mock mode we auto-generate a code and print it, simulating
  // an OTP the user would normally receive via SMS/app from their broker.
  const simulatedOtp = String(Math.floor(1000 + Math.random() * 9000));
  console.log(`    (Simulated OTP sent to your device: ${simulatedOtp})`);

  const answer = await ask("    Enter code to authorize sell (or blank to cancel): ");

  return answer === simulatedOtp;
}

module.exports = { requestAuthentication };
