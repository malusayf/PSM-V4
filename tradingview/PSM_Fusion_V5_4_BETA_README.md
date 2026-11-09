# PSM Fusion v5.4 Beta — install and verification

**Status:** Pine v6 beta source is published, but TradingView compilation, chart testing, and forward/backtesting are **not verified**. Do not treat new grades as win probabilities or use this beta as an execution trigger.

Source: [PSM_Fusion_V5_4_BETA.pine](./PSM_Fusion_V5_4_BETA.pine).
Working v5.3 remains at [PSM_Fusion_V5.pine](./PSM_Fusion_V5.pine) and was not changed.

## How to test
1. On TradingView, leave the existing v5.3 indicator saved and visible in your saved scripts.
2. Open Pine Editor and create a **new indicator** called `PSM Fusion V5.4 BETA`.
3. Copy the full v5.4 beta source, paste, save and click Add to chart.
4. Start with XAUUSD **15-minute** chart and default **PSM Trading** mode. Confirm charts, plots, signals and alerts match v5.3 while the new switches remain OFF.
5. In settings, switch on **Show explainable grading dashboard**; this is a descriptive confluence panel that does not alter signals.
6. After visual verification, optionally enable **Require enhanced setup grade** (minimum A by default). This intentionally filters original setup signals; it may significantly reduce them.
7. Test **Use protected swing stop + ATR buffer** independently; this intentionally alters stop/TP levels on newly formed plans and may suppress a trade with an excessive stop.
8. Test `PSM Crypto Investor` on a crypto symbol and `PSM Stock Investor` on stock/fund symbols using chart timeframes **below** their configured daily/weekly investor timeframes. Check old entry/stop/TP and position P/L values against v5.3.
9. Enable **Display crypto/stock additional risk flags** optionally. This changes only a new note panel, not investment decisions.
10. Test alerts, confirm all accepted Trading signals occur at bar close, reload chart and compare signal timestamps; use Bar Replay and paper-forward logs.

## Retained defaults
- Trading mode: 21/55 EMA, RSI, completed HTF confirmation, swing-break entry and ATR/structure stop; targets 1R, 2R, 3R.
- Crypto Investor: confirmed daily 50/200 EMA/risk regions and existing zones.
- Stock Investor: confirmed weekly 20/50 EMA/risk regions and existing zones.
- Investor position amount, entry, whole-share choice, fee estimate and projected P/L are unchanged.
- Existing alerts remain; **new graded BUY/SELL alerts are separately opt-in**.
- Original levels are not recalculated or moved to earlier candles after an event. The indicator reports possible bar-level TP/SL touches, never broker fills.

## What the beta *does* add
- Opt-in **0–100 point confluence score**. A+ >=90, A >=75, B >=60; below 60 Reject.
- Scoring uses confirmed HTF alignment, confirmed chart swing-break, prior recent stop sweep, **opposite candle / OB proxy**, observed 3-candle FVG, ATR range, and prior highs/lows as potential target obstacles. These are OHLC-based approximations, not externally verified liquidity or on-chain data.
- Opt-in enhanced grade filtering, descriptive panel, signal labels and graded alerts.
- Opt-in protective swing + ATR stop buffer.
- Opt-in extra crypto/stock risk note panel, including observed gap and manual earnings caution.

## Not in beta 1
- The separate V3 Sniper/0ABC BC-zone early-entry module has not been merged into this beta.
- A fully structure-aware TP engine and instrument-specific execution model are not implemented; original fixed-R TP defaults remain.
- Automated backtested performance, win probability, broker execution, on-chain token security data and real-time future earnings calendars are not supplied.

**Acceptance tests still outstanding:** TradingView Pine v6 compile with zero errors, identical v5.3 results with all new options disabled, Bar Replay vs reload comparisons on several symbols/timeframes, new-alert de-duplication, and separate strategy analysis with fees and slippage.
