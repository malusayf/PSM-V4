# PSM V4 — TradingView Pine Script Indicator

Open [PSM_V4_Market_Intelligence.pine](./PSM_V4_Market_Intelligence.pine), choose **Raw**, copy the full script, and paste it into **TradingView > Pine Editor**. Save it and click **Add to chart**.

This indicator runs on **whatever symbol / broker feed your TradingView chart is currently displaying**, including supported gold, forex, indices, stock, and crypto symbols. It does **not** read your broker account balances, saved drawings, or orders, and cannot place or manage broker orders.

## What it shows

- Confirmed swing-structure breakout signals filtered by EMA direction, RSI momentum, and optional confirmed higher-timeframe EMA bias
- Entry reference at **signal candle close**
- Structural/ATR stop loss and risk-based TP1, TP2, TP3
- Frozen reference levels until the next signal
- Alerts via **Any alert() function call** with entry/SL/TP values, or individual BUY/SELL alert conditions
- A small market-status panel and displayed fast/slow EMA

## Required configuration

On a 5-minute chart, the default higher timeframe is **1 hour**. On a 1-hour chart, choose e.g. 4-hour; on a 4-hour chart choose e.g. 1-day. **The HTF filter will intentionally block new signals if the chosen higher timeframe is not actually higher than the chart timeframe.** Disable the HTF filter if needed.

The indicator uses the active chart timeframe (including 5m); it can be put on other available TradingView intervals. Test every symbol and interval independently.

## Important limitations

- Research prototype, **not a statistically validated trading model**. A BUY or SELL is a rules-based setup, not a guarantee or an instruction to trade.
- TradingView alerts are triggered only on confirmed chart candles.
- TP and SL hits use high/low tests of subsequently closed candles, not broker order/fill records. If both SL and TP touch within a bar, the script conservatively records SL first. Spreads, gaps, commissions and slippage aren't modeled.
- HTF filter uses the previous completed higher-timeframe bar to reduce repainting.
- It does not implement a trained AI or verified probability engine; those would require a separate validated service.
- A Pine indicator cannot automatically import account watchlists, other indicators, private TradingView layouts, broker balances, or broker orders.
- Full compiling and visual validation in TradingView's Pine Editor **still required** before use. Report the exact error line if Pine Editor flags one.
