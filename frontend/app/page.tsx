"use client";
import { useEffect, useState } from "react";
type Instrument={symbol:string;name:string;market:string};
const API=process.env.NEXT_PUBLIC_API_URL||"http://localhost:8000";
const intervals=["1m","3m","5m","15m","30m","1h","4h","1d","1w","1M"];
export default function Home(){
 const [catalog,setCatalog]=useState<Instrument[]>([]);
 const [symbols,setSymbols]=useState<string[]>([]);
 const [primary,setPrimary]=useState("XAUUSD");
 const [tf,setTf]=useState("5m");
 const [selected,setSelected]=useState("BTCUSD");
 const [error,setError]=useState("");
 const [connected,setConnected]=useState(false);
 async function refresh(){try{
   const [a,b]=await Promise.all([fetch(API+"/instruments"),fetch(API+"/watchlist")]);
   if(!a.ok||!b.ok)throw Error("API not reachable");
   const instruments=await a.json();const watch=await b.json();
   setCatalog(instruments.instruments);setSymbols(watch.symbols);setPrimary(watch.primary);setConnected(true);setError("");
 }catch{setConnected(false);setError("Backend is not connected. Start FastAPI at localhost:8000.");}}
 useEffect(()=>{void refresh()},[]);
 async function mutation(path:string,method:"POST"|"DELETE",body?:object){try{
 const res=await fetch(API+path,{method,headers:{"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
 if(!res.ok)throw Error(await res.text());await refresh();
 }catch(e){setError(String(e));}}
 return <main>
 <header className="header"><div><span className="muted">⚔️ PSM V4 · FOUNDATION</span><h1>Market Intelligence</h1><p>Market-first analysis · Custom watchlists · Multi-timeframe context</p></div><span className="pill">{connected?"API connected":"API offline"}</span></header>
 <div className="grid"><aside className="panel"><h2>My Watchlist</h2><div className="row"><select value={selected} onChange={e=>setSelected(e.target.value)}>{catalog.filter(x=>!symbols.includes(x.symbol)).map(i=><option key={i.symbol}>{i.symbol}</option>)}</select><button onClick={()=>mutation("/watchlist","POST",{symbol:selected})}>+ Add</button></div>
 {symbols.map(s=><div className="item" key={s}><div><strong>{s}</strong><div className="muted">{catalog.find(i=>i.symbol===s)?.name||"Instrument"}</div></div><div className="row"><button className={s===primary?"active":""} onClick={()=>mutation("/watchlist/primary/"+s,"POST")}>{s===primary?"Primary":"View"}</button><button onClick={()=>mutation("/watchlist/"+s,"DELETE")}>×</button></div></div>)}
 <p className="muted">Starter catalog only. Broader market search requires a provider.</p></aside>
 <div><section className="panel"><h2>{primary||"No selected market"}</h2><div className="row">{intervals.map(x=><button key={x} className={tf===x?"active":""} onClick={()=>setTf(x)}>{x}</button>)}</div><p className="warning">No live price feed connected. A chart will appear when market data integration is implemented.</p><div style={{height:170,display:"grid",placeItems:"center",border:"1px dashed #415370",borderRadius:12}}>Chart awaiting licensed market data</div></section>
 <section className="panel"><h2>🧠 Market Voice</h2><p>Selected market: <strong>{primary||"None"}</strong> · Timeframe: <strong>{tf}</strong></p><p className="warning">WAIT — no validated market assessment available.</p><p>PSM will describe structure, volatility, momentum, scenarios, and invalidation once real data and tested models are connected.</p></section></div></div>
 {error&&<p className="warning">{error}</p>}<p className="muted">Prototype only. No live trading or financial advice.</p>
 </main>;
}
