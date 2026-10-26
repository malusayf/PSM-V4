import os
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal

app = FastAPI(title="PSM V4 Intelligence API", version="0.1.0")
allowed_origins = [origin.strip() for origin in os.getenv("PSM_ALLOWED_ORIGINS", "http://localhost:3000,https://psm-v4.vercel.app,https://psm-v4-knightshadeops-projects.vercel.app").split(",") if origin.strip()]
app.add_middleware(CORSMiddleware, allow_origins=allowed_origins, allow_credentials=False, allow_methods=["GET", "POST", "DELETE"], allow_headers=["*"])

INSTRUMENTS = [
    {"symbol": "XAUUSD", "name": "Gold / US Dollar", "market": "metals"},
    {"symbol": "EURUSD", "name": "Euro / US Dollar", "market": "forex"},
    {"symbol": "GBPJPY", "name": "British Pound / Japanese Yen", "market": "forex"},
    {"symbol": "BTCUSD", "name": "Bitcoin / US Dollar", "market": "crypto"},
    {"symbol": "ETHUSD", "name": "Ethereum / US Dollar", "market": "crypto"},
    {"symbol": "AAPL", "name": "Apple", "market": "stocks"},
]
TIMEFRAMES = ["1m", "3m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1M"]
watchlist = ["XAUUSD", "EURUSD"]
primary = "XAUUSD"

class AddSymbol(BaseModel):
    symbol: str

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0", "market_data": "not_connected"}

@app.get("/instruments")
def instruments():
    return {"instruments": INSTRUMENTS, "timeframes": TIMEFRAMES}

@app.get("/watchlist")
def get_watchlist():
    return {"symbols": watchlist, "primary": primary}

@app.post("/watchlist")
def add_symbol(item: AddSymbol):
    symbol = item.symbol.upper().strip()
    if symbol not in {x["symbol"] for x in INSTRUMENTS}:
        raise HTTPException(404, "Instrument is not in the starter catalog")
    if symbol not in watchlist:
        watchlist.append(symbol)
    return {"symbols": watchlist, "primary": primary}

@app.delete("/watchlist/{symbol}")
def remove_symbol(symbol: str):
    global primary
    symbol = symbol.upper()
    if symbol in watchlist:
        watchlist.remove(symbol)
    if primary == symbol:
        primary = watchlist[0] if watchlist else ""
    return {"symbols": watchlist, "primary": primary}

@app.post("/watchlist/primary/{symbol}")
def set_primary(symbol: str):
    global primary
    symbol = symbol.upper()
    if symbol not in watchlist:
        raise HTTPException(400, "Add the instrument to your watchlist first")
    primary = symbol
    return {"symbols": watchlist, "primary": primary}

@app.get("/intelligence/{symbol}")
def intelligence(symbol: str, timeframe: str = "5m"):
    symbol = symbol.upper()
    if symbol not in {x["symbol"] for x in INSTRUMENTS}:
        raise HTTPException(404, "Unknown instrument")
    if timeframe not in TIMEFRAMES:
        raise HTTPException(400, "Unsupported timeframe")
    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "mode": "provider_not_connected",
        "direction": None,
        "confidence": None,
        "decision": "WAIT",
        "message": "Market data is not connected. No trading assessment is available.",
    }

# Coinbase Exchange publicly documents 60/300/900/3600/21600/86400 second candles.
# These are delayed snapshot pulls, NOT streaming real-time ticks.
CRYPTO_PRODUCTS = {"BTCUSD": "BTC-USD", "ETHUSD": "ETH-USD"}
CRYPTO_GRANULARITIES = {"1m": 60, "5m": 300, "15m": 900, "1h": 3600, "1d": 86400}

@app.get("/candles/{symbol}")
def get_candles(symbol: str, timeframe: str = "5m"):
    symbol = symbol.upper()
    if symbol not in CRYPTO_PRODUCTS:
        raise HTTPException(status_code=422, detail="Live candles are currently available only for BTCUSD and ETHUSD; other markets need a licensed provider.")
    if timeframe not in CRYPTO_GRANULARITIES:
        raise HTTPException(status_code=422, detail="This provider supports 1m, 5m, 15m, 1h, and 1d in this prototype.")
    url = (
        "https://api.exchange.coinbase.com/products/"
        + CRYPTO_PRODUCTS[symbol]
        + "/candles?granularity=" + str(CRYPTO_GRANULARITIES[timeframe])
    )
    req = urllib.request.Request(url, headers={"User-Agent": "PSM-V4-research-prototype/0.1", "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            rows = json.load(response)
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ValueError):
        raise HTTPException(status_code=503, detail="The public Coinbase candle feed is temporarily unavailable.")
    if not isinstance(rows, list):
        raise HTTPException(status_code=503, detail="Unexpected response from market data feed.")
    candles = []
    for row in rows:
        if not isinstance(row, list) or len(row) < 6:
            continue
        try:
            ts, low, high, opn, close, volume = row[:6]
            candle = {"time": int(ts), "open": float(opn), "high": float(high),
                      "low": float(low), "close": float(close), "volume": float(volume)}
            if candle["low"] <= min(candle["open"], candle["close"]) <= max(candle["open"], candle["close"]) <= candle["high"]:
                candles.append(candle)
        except (ValueError, TypeError):
            continue
    candles.sort(key=lambda x: x["time"])
    return {"symbol": symbol, "timeframe": timeframe, "source": "Coinbase Exchange", 
            "data_type": "public_exchange_candles", "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "streaming": False, "candles": candles[-180:]}
