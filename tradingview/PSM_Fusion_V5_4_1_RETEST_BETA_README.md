# PSM Fusion v5.4.1 — Protected-Retest Beta (not performance validated)

This experimental TradingView Pine v6 indicator was created after four user screenshots showed buy/sell reference plans that appeared to reverse toward or through their stops. It is a **separate file**; the original v5.3 and v5.4 betas are unchanged. No source is an automatic broker order, and source inspection is not a win-rate backtest.

## Why the existing signals can fail

In v5.3/v5.4 default Trading mode, signals are issued on the **first confirmed close breaking a previously confirmed swing** while fast/slow EMA, RSI and the selected higher-TF EMA align. A breakout close can be a stop run, late exhaustion, news spike or false break; ATR-backed stops protect a defined plan but cannot predict the subsequent price. Multi-asset support is NOT evidence of profitability. The v5.4 grade filter defaults OFF, and auto timeframe defaults OFF.

The uploaded chart snapshots show several trades where price appears to trade through stop references, but don't show every timeframe, ticker header, precise chronological bar or indicator version. A photo of a plan isn't a verified fill or a complete outcome sample.

## New test behavior (Trading mode only)

**V5.4.1 / Retest Entry Protection** defaults ON in this separate beta:

1. Do NOT label the original breakout candle as an entry. On a confirmed close outside an established swing, remember the direction, level and bar.
2. Wait up to 6 completed chart bars for a retest close; BUY needs a low near the broken swing, close back above it, a bullish candle closing within the upper 40% of its range, plus continued EMA and HTF alignment. SELL mirrors these.
3. Reject retests with an excessively deep swing violation (>0.65 ATR), an entry extended >1.4 ATR beyond fast EMA, or suggested risk wider than 3 ATR. Optionally require the fast EMA to slope in trade direction (ON by default).
4. On a valid, **later confirmed** retest candle, establish Entry/SL/TP1-3 using the existing Trading plan rules, preserving the source's stop-first same-bar ambiguity policy.
5. Suppress overlapping plans while another protected plan remains active. Expire unconfirmed retests rather than invent a late or earlier fill.

New status row displays **WAIT FOR BREAKOUT**, **AWAIT BUY RETEST**, **AWAIT SELL RETEST**, or **OFF (ORIGINAL ENTRY)**. Turning off `Wait for confirmed breakout + retest` returns to original v5.4 beta entry behavior.

Existing A+/A/B scoring, AUTO timeframe option, separate Crypto and Stock Investor modes, and their projected P/L remain. Optional quality grade still defaults OFF; to combine filters switch it ON and choose minimum grade. These OHLC indicators cannot assess on-chain liquidity or guarantee fills.

## Practical test

1. [Open source](./PSM_Fusion_V5_4_1_RETEST_BETA.pine). Save as a **new** TradingView indicator. Do not overwrite your working script.
2. Confirm Pine v6 compiles. This repository update has NOT been run in TradingView Pine Editor.
3. Test XAUUSD, EURUSD, CHFUSD and USDCAD on **the exact same chart timeframes** and dates as the reported screenshots; check instrument names because cropped screenshots can hide them.
4. Compare v5.4 original breakout signals vs v5.4.1 retest signals, with matching EMA, HTF, RSI and risk parameters. Record **all** opportunities, missed trades, stop touches, TP touches, and no-signal events, not only four unfavorable screenshots.
5. Keep AUTO analysis timeframe OFF until the same timeframe is verified against manual selection, then test AUTO on.
6. Add a separate Pine `strategy()` backtest for fees, spread, slippage, broker emulator intrabar assumptions, and unseen periods before concluding anything improved.
7. The TradingView indicator is informational only; a shown entry is a reference close, not a broker order fill. Stops may fill worse than the plotted price, especially across volatile gaps.

## Pending formal QA

- [ ] Pine v6 editor compilation succeeds with no errors
- [ ] Chart replay/reload confirmed-bar signals match
- [ ] Guard works for retests expiring, reversing, and overlapping plans
- [ ] Independent historical sample and out-of-sample performance are reported
- [ ] Verify original v5.3 and v5.4 preserved, no signal claims based on four selected examples alone

