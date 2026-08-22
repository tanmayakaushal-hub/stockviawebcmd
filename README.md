# Stock Price Watcher (WebCMD Adapter)

**GDG NIT Hamirpur — Web CMD Hackathon (Agentic Payments Edition)**

Automatically watches a stock's price, and when it touches your target, asks
you to authenticate before placing a sell order — no unattended trading.

## The Flow

```
watch price → target touched → ask for authentication → confirmed? → place sell order
                                                        → declined?  → cancel, log it
```

This matches the hackathon's "Agentic Payments" theme: an agent can *watch*
and *prepare* a financial action, but a real money-moving step always pauses
for explicit human confirmation.

## Command

```bash
webcmd stock watch --symbol RELIANCE.NS --target 1500 --quantity 1 --condition touch
```

| Flag | Meaning |
|---|---|
| `--symbol` | Stock ticker (NSE format, e.g. `RELIANCE.NS`, `TCS.NS`) |
| `--target` | Price to watch for |
| `--quantity` | Shares to sell once triggered |
| `--condition` | `touch` (>=) or `drop` (<=) |

## Project Structure

```
stock-price-watcher/
├── README.md
├── package.json
├── src/
│   ├── adapter.js       # main webcmd command + watch loop
│   ├── priceSource.js   # pluggable live price fetcher
│   ├── auth.js          # authentication gate before any sell
│   └── broker.js        # broker order stub (NOT wired to real money)
└── examples/
    └── sample-run-log.txt
```

## ⚠️ Important — read before using with real money

- `src/broker.js` is a **stub**. It does not place any real order. Where a
  real broker call would go, it's marked `// TODO: wire real broker API here`.
- To go live you'd plug in your broker's official API (e.g. Zerodha Kite
  Connect, Upstox API, Groww API) — each requires its own app registration,
  API key, and its own auth flow (usually OAuth + TOTP). None of that is
  included here on purpose — that's account-specific and security-sensitive.
- `src/auth.js` simulates an authentication prompt (CLI y/n + PIN-style
  confirmation). Swap this for your broker's real 2FA/TOTP check before
  connecting `broker.js` to anything real.
- **Never hardcode API keys or broker credentials in this repo.** Use a
  local `.env` file (already in `.gitignore`) if you wire in real credentials.

## Price data

`src/priceSource.js` is written against Yahoo Finance's public chart
endpoint (`query1.finance.yahoo.com`) as the default free source, with NSE
India's public quote endpoint as a documented alternative. This repo's
sandbox environment couldn't reach either while building this (network is
restricted to package registries), so:

- The **code** targets the real endpoints — run it on your own machine and
  it will fetch real live prices.
- The **demo video** (`terminal_demo.mp4`) runs in `MOCK_MODE`, using a
  simulated price ramp instead of a live network call, so the full
  watch → trigger → auth → sell flow could be shown end-to-end. This is
  clearly labeled in the video and in the code (`MOCK_MODE` flag in
  `priceSource.js`).

## Run it yourself

```bash
npm install
node src/adapter.js --symbol RELIANCE.NS --target 1500 --quantity 1
```

### Reproduce the demo log/video exactly

`capture-run.js` runs the same flow in `MOCK_MODE` with a stubbed
auto-confirm auth step, so it produces the exact deterministic log used in
`examples/sample-run-log.txt` and `terminal_demo.mp4` without needing you to
type the OTP by hand:

```bash
node capture-run.js
```

## Hackathon angle

Ships as a reusable WebCMD adapter with a clear safety boundary: watching
and evaluating conditions is fully automated, but anything that touches
real money always stops for human authentication.
