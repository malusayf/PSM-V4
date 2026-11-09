# PSM Fusion v5.4 — Design & Acceptance Specification

**Status: specification only. No Pine v5.4 beta compiled or released yet.**

## Baseline verified
Source: `tradingview/PSM_Fusion_V5.pine` (Pine v6, header: PSM Fusion V5.3).
Preserve all three modes with their exact names and defaults: **PSM Trading**, **PSM Crypto Investor**, **PSM Stock Investor**.

- Trading: 21/55 EMA, RSI14, prior confirmed pivot breakout, last closed HTF EMA alignment, ATR-backed structural stop and current TP defaults 1R/2R/3R. Its entry is a reference signal-candle close, not an executed fill. Existing one-active-plan status, stop-first same-bar ambiguity policy, alerts and dashboard must remain.
- Crypto Investor: last-confirmed default daily 50/200 EMAs, ATR, RSI, support and season/BUY/HOLD/REDUCE/INVALIDATION logic; existing entry, soft/hard SL and TP1–TP3 regions must remain.
- Stock Investor: last-confirmed default weekly 20/50 EMAs, stock/fund asset check, price bands, support and invalidation/TP regions must remain.
- Both investors: preserve entered position amount, actual entry, estimated fixed per-side fees, stock whole-share rounding and *estimated* spot-long net-P/L panel.

**Important:** checked v5.3 source's Trading engine is V4-style confirmed swing breakout, not the separate V3 Sniper early/golden-OB engine. Add V3 only through a separate optional module with a verified prior version, never assert it already exists.

## Delivery guardrails
1. Develop in new `tradingview/PSM_Fusion_V5_4_BETA.pine`; DO NOT overwrite current v5.3.
2. Every advanced behavior defaults **OFF** to preserve existing mode results and alerts.
3. New confluence grades default display-only, never claim historical win probability.
4. No broker execution in the Pine indicator, no repainting claims without TradingView chart/replay tests.

## New optional Trading confluence engine
On confirmed chart candle after **existing** Trading validity conditions, compute a 0–100 explainable score using only data observable at that time:

| Evidence | Max points |
| --- | ---: |
| Confirmed higher-timeframe alignment | 20 |
| Confirmed structural breakout or CHoCH | 20 |
| Prior confirmed liquidity sweep and reclaim | 15 |
| Directional, fresh order-block proximity | 15 |
| Directional, unfilled / partly filled three-candle FVG | 10 |
| ATR volatility suitability | 10 |
| Reachable opposing-liquidity target / minimum R:R | 10 |

Score labels: **A+ 90–100, A 75–89, B 60–74, REJECT below 60**.
Scores indicate confluence, **not probability**. Missing data is marked UNKNOWN, never assumed true. Show brief rejection reasons.

New group `V5.4 / Intelligence (opt-in)`:
- Enhanced signal filtering OFF by default, new enhanced alerts OFF unless enabled.
- Minimum enhanced grade default A.
- Liquidity-sweep, OB, FVG, volatility/session filters individually toggleable, each OFF by default.
- Enhanced structure-aware SL/TP OFF by default.
- Show grade/reason optionally; bound arrays and drawings to Pine limits.

**New setup lifecycle:** CANDIDATE → CONFIRMED or REJECTED → ACTIVE → TP1/TP2/TP3, SL, or EXPIRED. The currently implemented v5.3 Trading signals and original alert names stay unchanged when optional mode is OFF. Snapshots of Entry/SL/TP/grade/time are frozen on the signal bar. Do not move a historical signal to an earlier pivot candle or treat signal close as fill. Existing stop-first convention must be retained and documented where both SL and target occur within one OHLC bar.

## Optional enhanced exits
Existing structural-plus-ATR stop and 1R/2R/3R targets are the default. If explicitly enabled, evaluate protected swing and valid OB invalidation with ATR buffer and potential opposing structural liquidity as target obstacles; show structural targets and R multiples separately; reject impossible or invalid risk ranges. Mark breakeven movement after TP1 as hypothetical until an actual execution system exists. Never rewrite the initial plan's risk or pretend target touches are fills.

## Optional early Sniper integration (later subfeature)
Use the vetted V3/0ABC source to add a distinct **EARLY** tier: 15M 0→A retracement; BC zone Fib 0.500–0.786; rejection within zone and first confirmed close outside it in the trade direction; protective opposite swing stop; symmetrical shorts, expiry and invalidation. If later V4 confirmation upgrades a matching active early plan, keep its original Entry/SL/TP and do not double-count it. Do not switch it on by default or merge without line-by-line source parity checks.

## Investor improvements (additive)
- Crypto: risk flags for ATR expansion, EMA extension and repeated confirmed support breaks. On-chain holder concentration, liquidity locks, mint permissions and whale flows cannot be determined reliably from Pine OHLC; indicate unavailable, don't fabricate on-chain grades.
- Stocks: flag observed overnight gaps, ATR-extension, proximity to invalidation and manual earnings-event blackout (Pine does not supply universally reliable future earnings calendars). Clearly warn for split/dividend and adjusted-price differences.
- Keep all existing investor zone calculations and P/L untouched by default. Price P/L is estimated from user-entered entry and illustrative targets, not brokerage proceeds.

## Repainting / alerts
- Trading enhanced events must require `barstate.isconfirmed`.
- Higher-TF requests must use last completed values (for example `request.security(syminfo.tickerid, htf, close[1], lookahead=barmerge.lookahead_on)`) and validate HTF strictly > chart TF.
- For investor event alerts use fresh completed investor-TF data AND chart bar closure. Once-per-event deduplication.
- Swing pivots become known only after the configured right-bars delay. Do not relocate event time backward to the pivot candle.
- Preserve all legacy alert names/text. Add separate optional v5.4 confirmed-grade, block, invalidation and observed TP/SL alerts.

## Performance evidence
Create **separate** `PSM_Fusion_V5_4_Strategy_BETA.pine` later. Strategy should model earliest eligible entry, spread/slippage/fees, stops, partial TP rules, gaps, bar magnifier if available, and broker emulator uncertainties. Report symbol, timeframe, period, sample size, A+/A/B groups, signal and blocked counts, net expectancy (R), drawdown, TP touch rates, and OOS/forward testing. v5.3 bar-tested TP/SL touches are NOT verified realized results.

## Approval checklist for beta
- [ ] Copy baseline to a **new** Pine file, no v5.3 overwrite.
- [ ] All three modes retain original defaults, investor band values, P/L examples and existing alert names when enhancements OFF.
- [ ] No new future-data lookahead, unconfirmed event or backward shifted labels.
- [ ] Independent compile in TradingView Pine v6 succeeds without relevant errors.
- [ ] Replay vs reload signals match for confirmed historical bars.
- [ ] New enhanced alerts are once per intended event.
- [ ] Companion strategy explicitly states simulated results, fees, date range and assumptions.
- [ ] Check XAUUSD M15/H1, major crypto M15/H1/D, and stock H1/D including gaps and invalid timeframe inputs.

## Technical references
- [Baseline v5.3](https://github.com/malusayf/PSM-V4/blob/main/tradingview/PSM_Fusion_V5.pine)
- [TradingView repainting](https://www.tradingview.com/pine-script-docs/concepts/repainting/)
- [TradingView strategy simulation](https://www.tradingview.com/pine-script-docs/concepts/strategies/)
- [TradingView alerts](https://www.tradingview.com/pine-script-docs/concepts/alerts/)
