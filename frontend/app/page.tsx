"use client";
import { useEffect, useState } from "react";

type Instrument={symbol:string;name:string;market:string};
type Candle={time:number;open:number;high:number;low:number;close:number;volume:number};
type CandleResponse={symbol:string;timeframe:string;source:string;retrieved_at:string;streaming:boolean;candles:Candle[]};
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
function CandleChart({candles}:{candles:Candle[]}){
 const points=candles.slice(-90);
 if(!points.length)return <div className="chart-empty">No candle data available.</div>;
 const min=Math.min(...points.map(x=>x.low));
 const max=Math.max(...points.map(x=>x.high));
 const range=Math.max(max-min,0.000001);
 const W=900,H=360,top=16,bottom=32,left=16,right=76;
 const drawW=W-left-right,drawH=H-top-bottom;
 const y=(n:number)=>top+(max-n)/range*drawH;
 const step=drawW/points.length;
 const bodyW=Math.max(2,step*.66);
 const ticks=[0,1,2,3,4].map(i=>min+(max-min)*i/4);
 return <div style={{overflowX:"auto"}} role="img" aria-label={"Candlestick chart with "+points.length+" recent real exchange candles"}>
 <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",minWidth:420,display:"block",background:"#0c1423",borderRadius:12}}>
 {ticks.map((v,i)=><g key={i}><line x1={left} x2={W-right+8} y1={y(v)} y2={y(v)} stroke="#283449" strokeDasharray="3 5"/>
 <text x={W-right+14} y={y(v)+4} fill="#b9c8d8" fontSize="12">{v.toFixed(v>=100?0:2)}</text></g>)}
 {points.map((c,i)=>{const x=left+step*(i+.5);const rising=c.close>=c.open;const color=rising?"#32c9a6":"#f47783";
 const yTop=y(Math.max(c.open,c.close));const bodyHeight=Math.max(1,Math.abs(y(c.open)-y(c.close)));
 return <g key={c.time}><line x1={x} y1={y(c.high)} x2={x} y2={y(c.low)} stroke={color} strokeWidth="1.5"/>
 <rect x={x-bodyW/2} y={yTop} width={bodyW} height={bodyHeight} fill={color}/></g>})}
 {points.filter((_,i)=>i%Math.max(1,Math.floor(points.length/6))===0).map(c=>{const i=points.findIndex(x=>x.time===c.time);
 return <text key={c.time} x={left+step*(i+.5)} y={H-10} textAnchor="middle" fill="#aebad2" fontSize="12">{new Date(c.time*1000).toLocaleString(undefined,{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})}</text>})}
 </svg></div>;
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
 const [marketData,setMarketData]=useState<CandleResponse|null>(null);
 const [chartStatus,setChartStatus]=useState("Waiting for market selection");
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
 useEffect(()=>{
  let cancelled=false;
  let inFlight=false;
  setMarketData(null);
  if(!["BTCUSD","ETHUSD"].includes(primary)){
   setChartStatus(primary?"Candles for this market require another authorized data provider.":"Select a market.");
   return;
  }
  if(!["1m","5m","15m","1h","1d"].includes(tf)){
   setChartStatus("This public exchange feed does not support the chosen interval yet.");
   return;
  }
  async function update(){
   if(inFlight)return;
   inFlight=true;
   try{
    const response=await fetch(API+"/candles/"+primary+"?timeframe="+encodeURIComponent(tf),{cache:"no-store"});
    if(!response.ok)throw Error("Market feed unavailable ("+response.status+")");
    const data:CandleResponse=await response.json();
    if(!cancelled){
     setMarketData(data);
     setChartStatus(data.candles.length?"":"No candles returned by the provider.");
    }
   }catch(e){if(!cancelled){setChartStatus(String(e));setMarketData(null);}}
   finally{inFlight=false;}
  }
  setChartStatus("Loading actual market candles...");
  void update();
  const timer=setInterval(()=>{void update()},60000);
  return ()=>{cancelled=true;clearInterval(timer)};
 },[primary,tf]);
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
    {marketData&&marketData.candles.length>0?<><p className="success">Real exchange candles · {marketData.source} · Snapshot refresh every 60 seconds (not streaming)</p>
    <CandleChart candles={marketData.candles}/>
    <p className="muted">Latest candle time: {new Date(marketData.candles[marketData.candles.length-1].time*1000).toLocaleString()}. Last price: {marketData.candles[marketData.candles.length-1].close.toLocaleString()} USD. Candles can be incomplete and are not trade signals.</p></>
    :<div className="chart-empty">{chartStatus}</div>}
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
 <p className="muted">Early prototype · No live trading or validated signals.</p>
 </main>;
}
