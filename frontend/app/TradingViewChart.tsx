"use client";
import { useEffect, useRef } from "react";

const symbols:Record<string,string>={
 XAUUSD:"OANDA:XAUUSD",EURUSD:"OANDA:EURUSD",GBPJPY:"OANDA:GBPJPY",
 BTCUSD:"COINBASE:BTCUSD",ETHUSD:"COINBASE:ETHUSD",AAPL:"NASDAQ:AAPL"
};
const intervals:Record<string,string>={
 "1m":"1","3m":"3","5m":"5","15m":"15","30m":"30",
 "1h":"60","4h":"240","1d":"D","1w":"W","1M":"M"
};

export default function TradingViewChart({symbol,timeframe}:{symbol:string;timeframe:string}){
 const container=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const element=container.current;
  if(!element)return;
  element.replaceChildren();
  const inner=document.createElement("div");
  inner.className="tradingview-widget-container__widget";
  inner.style.height="100%";
  inner.style.width="100%";
  element.appendChild(inner);
  const script=document.createElement("script");
  script.type="text/javascript";
  script.async=true;
  script.src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  script.textContent=JSON.stringify({
   autosize:true,symbol:symbols[symbol]||"OANDA:XAUUSD",
   interval:intervals[timeframe]||"5",timezone:"Etc/UTC",
   theme:"dark",style:"1",locale:"en",allow_symbol_change:true,
   withdateranges:true,hide_side_toolbar:false,hide_top_toolbar:false,
   save_image:true,calendar:false,support_host:"https://www.tradingview.com"
  });
  element.appendChild(script);
  return()=>{element.replaceChildren()};
 },[symbol,timeframe]);
 return <div ref={container} className="tradingview-widget-container" style={{width:"100%",height:530}} aria-label="TradingView advanced financial chart"/>;
}
