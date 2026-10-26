"use client";
import { useEffect, useState } from "react";
import TradingViewChart from "./TradingViewChart";

type Instrument={symbol:string;name:string;market:string};
type SavedPreferences={version:1;symbols:string[];primary:string;timeframe:string};
const API=process.env.NEXT_PUBLIC_API_URL||"http://localhost:8000";
const STORAGE_KEY="psm-v4:watchlist:v1";
const intervals=["1m","3m","5m","15m","30m","1h","4h","1d","1w","1M"];
const starterSymbols=["XAUUSD","EURUSD"];
function isSavedPreferences(v:unknown):v is SavedPreferences{
 if(!v||typeof v!=="object")return false;
 const x=v as Partial<SavedPreferences>;
 return x.version===1&&Array.isArray(x.symbols)&&x.symbols.every(s=>typeof s==="string")&&
 typeof x.primary==="string"&&typeof x.timeframe==="string";
}
export default function Home(){
 const [catalog,setCatalog]=useState<Instrument[]>([]);
 const [symbols,setSymbols]=useState<string[]>(starterSymbols);
 const [primary,setPrimary]=useState("XAUUSD");
 const [tf,setTf]=useState("5m");
 const [selected,setSelected]=useState("");
 const [error,setError]=useState("");
 const [connected,setConnected]=useState(false);
 const [loaded,setLoaded]=useState(false);

 useEffect(()=>{
  try{
   const raw=localStorage.getItem(STORAGE_KEY);
   if(raw){
    const saved:unknown=JSON.parse(raw);
    if(isSavedPreferences(saved)){
     const distinct=Array.from(new Set(saved.symbols.map(s=>s.toUpperCase().trim()))).slice(0,100);
     setSymbols(distinct);
     setPrimary(distinct.includes(saved.primary)?saved.primary:(distinct[0]||""));
     setTf(intervals.includes(saved.timeframe)?saved.timeframe:"5m");
    }
   }
  }catch{setError("Saved preferences could not be read. Your changes will be saved again.");}
  setLoaded(true);
 },[]);
 useEffect(()=>{
  if(!loaded)return;
  const settings:SavedPreferences={version:1,symbols,primary,timeframe:tf};
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(settings))}
  catch{setError("Browser storage is unavailable. Watchlist changes might not survive reloads.")}
 },[loaded,symbols,primary,tf]);
 useEffect(()=>{
  let cancelled=false;
  async function load(){
   try{
    const res=await fetch(API+"/instruments",{cache:"no-store"});
    if(!res.ok)throw Error("API unavailable");
    const data=await res.json();
    if(!cancelled){
     setCatalog(data.instruments);
     setConnected(true);
     setError("");
    }
   }catch{
    if(!cancelled){setConnected(false);setError("The market catalog API is currently unavailable.")}
   }
  }
  void load();
  return ()=>{cancelled=true};
 },[]);
 const available=catalog.filter(i=>!symbols.includes(i.symbol));
 function add(){
  const symbol=selected||available[0]?.symbol;
  if(!symbol)return;
  setSymbols(old=>old.includes(symbol)?old:[...old,symbol]);
  if(!primary)setPrimary(symbol);
  setSelected("");
 }
 function remove(symbol:string){
  const updated=symbols.filter(s=>s!==symbol);
  setSymbols(updated);
  if(primary===symbol)setPrimary(updated[0]||"");
 }
 return <main>
 <header className="header">
  <div><span className="muted">⚔️ PSM V4 · FOUNDATION</span><h1>Market Intelligence</h1>
   <p>Market-first analysis · Custom watchlists · Multi-timeframe context</p></div>
  <span className="pill">{connected?"API connected":"API offline"}</span>
 </header>
 <div className="grid">
  <aside className="panel">
   <h2>My Watchlist</h2>
   <div className="row">
    <select aria-label="Market to add" value={available.some(i=>i.symbol===selected)?selected:(available[0]?.symbol||"")} onChange={e=>setSelected(e.target.value)} disabled={!available.length}>
     {available.map(i=><option key={i.symbol} value={i.symbol}>{i.symbol} · {i.name}</option>)}
    </select>
    <button onClick={add} disabled={!available.length}>+ Add</button>
   </div>
   {symbols.map(s=><div className="item" key={s}><div><strong>{s}</strong>
    <div className="muted">{catalog.find(i=>i.symbol===s)?.name||"Saved instrument"}</div></div>
    <div className="row">
     <button className={s===primary?"active":""} onClick={()=>setPrimary(s)}>{s===primary?"Primary":"View"}</button>
     <button aria-label={"Remove "+s} onClick={()=>remove(s)}>×</button>
    </div></div>)}
   {!symbols.length&&<p className="muted">Your watchlist is empty. Add a market to begin.</p>}
   <p className="muted">Saved in this browser only, not yet synced between devices.</p>
   <p className="muted">Starter instrument catalog; provider-backed search comes next.</p>
  </aside>
  <div>
   <section className="panel">
    <h2>{primary||"No selected market"}</h2>
    <div className="row">{intervals.map(x=><button key={x} className={tf===x?"active":""} onClick={()=>setTf(x)}>{x}</button>)}</div>
    <TradingViewChart symbol={primary} timeframe={tf}/>
    <div className="row" style={{justifyContent:"space-between",marginTop:12}}>
     <p className="muted">Chart powered by TradingView. Prices, indicators and drawing tools are supplied by TradingView; PSM does not inherit your TradingView account settings or brokers.</p>
     <a href="https://www.tradingview.com/chart/" target="_blank" rel="noopener noreferrer" style={{color:"#c4b5fd",whiteSpace:"nowrap"}}>Open My TradingView Workspace ↗</a>
    </div>
   </section>
   <section className="panel">
    <h2>🧠 Market Voice</h2>
    <p>Selected market: <strong>{primary||"None"}</strong> · Timeframe: <strong>{tf}</strong></p>
    <p className="warning">WAIT — no validated market assessment available.</p>
    <p>PSM will describe structure, volatility, momentum, scenarios and invalidation after real data and tested models are connected.</p>
   </section>
  </div>
 </div>
 {error&&<p className="warning" role="alert">{error}</p>}
 <p className="muted">Early prototype · TradingView provides chart data, not PSM intelligence or broker access. No validated trade signals.</p>
 </main>;
}
