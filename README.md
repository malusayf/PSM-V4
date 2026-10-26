# PSM V4 — Market Intelligence Platform

Early **market-first** trading intelligence application (Stage 1 foundation).

## Current features
- Next.js dashboard with responsive layout and market/timeframe selector.
- FastAPI backend with instrument catalog, in-memory customizable watchlist, and primary market.
- Supported selector intervals: 1m, 3m, 5m, 15m, 30m, 1h, 4h, 1d, 1w, 1M.
- Market Voice placeholder that explicitly returns **WAIT** until data/model validation is available.

**Important:** This repository does not yet contain a live market-data subscription, real price chart, production authentication, database persistence, broker connectivity, or validated forecasts. Watchlist settings reset when the API restarts. Never use placeholder output as a trading recommendation.

## Run locally (requires Python 3.10+ and Node.js 20+)

Backend terminal:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API documentation: http://localhost:8000/docs

Frontend terminal (new terminal window):
```bash
cd frontend
npm install
npm run dev
```

Dashboard: http://localhost:3000

If the backend is hosted elsewhere, set `NEXT_PUBLIC_API_URL` to its HTTP(S) address for the frontend build.

## Development roadmap
1. Live licensed market-data provider and real chart/candle history.
2. Persistent user-specific watchlists and secure authentication.
3. Multi-timeframe market-understanding engine and evidence log.
4. Conditional forecasts, risk safeguards, evaluation and paper-trading.
5. TradingView webhook integration, observability and deployment.

Research / development use only; no guaranteed trading outcomes.
