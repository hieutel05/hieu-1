import React, { useEffect, useMemo, useState } from 'react'

function fmt(n: number, digits = 2) {
  if (Number.isNaN(n) || !Number.isFinite(n)) return '-';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
}
function pct(a: number) {
  if (Number.isNaN(a) || !Number.isFinite(a)) return '-';
  return `${fmt(a, 2)}%`;
}
const steps = [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80];

export default function App() {
  const [buy, setBuy] = useState<number>(() => Number(localStorage.getItem('buy') ?? 1));
  const [current, setCurrent] = useState<number>(() => Number(localStorage.getItem('current') ?? 2));
  const [qty, setQty] = useState<number>(() => Number(localStorage.getItem('qty') ?? 100));
  const [date, setDate] = useState<string>(() => localStorage.getItem('date') ?? new Date().toISOString().slice(0,16));

  useEffect(() => {
    localStorage.setItem('buy', String(buy));
    localStorage.setItem('current', String(current));
    localStorage.setItem('qty', String(qty));
    localStorage.setItem('date', date);
  }, [buy, current, qty, date]);

  const invested = useMemo(() => buy * qty, [buy, qty]);
  const currentValue = useMemo(() => current * qty, [current, qty]);
  const profitUSD = useMemo(() => currentValue - invested, [currentValue, invested]);
  const profitPct = useMemo(() => (buy > 0 ? ((current - buy) / buy) * 100 : NaN), [current, buy]);

  const scenarios = useMemo(() => {
    return steps.map(s => {
      const d = -s/100, u = s/100;
      const priceDown = current * (1 + d);
      const priceUp = current * (1 + u);
      const lossUSD = (priceDown - current) * qty;   // negative
      const gainUSD = (priceUp - current) * qty;     // positive
      const pnlVsBuyDownPct = buy > 0 ? ((priceDown - buy) / buy) * 100 : NaN;
      const pnlVsBuyUpPct = buy > 0 ? ((priceUp - buy) / buy) * 100 : NaN;
      return { step: s, priceDown, lossUSD, pnlVsBuyDownPct, priceUp, gainUSD, pnlVsBuyUpPct };
    });
  }, [current, qty, buy]);

  function reset() {
    setBuy(1); setCurrent(2); setQty(100); setDate(new Date().toISOString().slice(0,16));
  }

  return (
    <div className="container" style={{maxWidth:960, margin:'0 auto', padding:16}}>
      <h1 style={{fontSize:22, fontWeight:700}}>📱 Coin Profit/Loss Calculator</h1>
      <div style={{color:'#64748b', fontSize:14, marginBottom:8}}>PWA – cài lên màn hình chính và dùng offline</div>

      <div className="card" style={{marginTop:12, padding:16, borderRadius:16, background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
        <div className="row" style={{display:'grid', gap:12, gridTemplateColumns:'1fr', marginBottom:12}}>
          <label style={{display:'grid', gap:6}}>
            <span style={{color:'#64748b', fontSize:12}}>Ngày/Giờ</span>
            <input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} />
          </label>
          <label style={{display:'grid', gap:6}}>
            <span style={{color:'#64748b', fontSize:12}}>Giá mua (USD)</span>
            <input inputMode="decimal" value={buy} onChange={e=>setBuy(Number(e.target.value))} />
          </label>
          <label style={{display:'grid', gap:6}}>
            <span style={{color:'#64748b', fontSize:12}}>Giá hiện tại (USD)</span>
            <input inputMode="decimal" value={current} onChange={e=>setCurrent(Number(e.target.value))} />
          </label>
        </div>
        <div className="row" style={{display:'grid', gap:12, gridTemplateColumns:'1fr', marginBottom:12}}>
          <label style={{display:'grid', gap:6}}>
            <span style={{color:'#64748b', fontSize:12}}>Số lượng coin</span>
            <input inputMode="numeric" value={qty} onChange={e=>setQty(Number(e.target.value))} />
          </label>
          <div className={"stat " + (profitUSD>=0?'pos':'neg')} style={{padding:12,border:'1px solid #e5e7eb',borderRadius:12}}>
            <div style={{color:'#64748b', fontSize:12}}>Lợi nhuận (USD)</div>
            <div style={{fontWeight:700, fontSize:18}}>$ {fmt(profitUSD)}</div>
          </div>
          <div className={"stat " + (profitPct>=0?'pos':'neg')} style={{padding:12,border:'1px solid #e5e7eb',borderRadius:12}}>
            <div style={{color:'#64748b', fontSize:12}}>Lợi nhuận (%)</div>
            <div style={{fontWeight:700, fontSize:18}}>{pct(profitPct)}</div>
          </div>
        </div>
        <div className="row" style={{display:'grid', gap:12, gridTemplateColumns:'1fr', marginBottom:4}}>
          <div className="stat" style={{padding:12,border:'1px solid #e5e7eb',borderRadius:12}}>
            <div style={{color:'#64748b', fontSize:12}}>Vốn đầu tư</div>
            <div style={{fontWeight:700}}>$ {fmt(invested)}</div>
          </div>
          <div className="stat" style={{padding:12,border:'1px solid #e5e7eb',borderRadius:12}}>
            <div style={{color:'#64748b', fontSize:12}}>Giá trị hiện tại</div>
            <div style={{fontWeight:700}}>$ {fmt(currentValue)}</div>
          </div>
          <button onClick={reset} style="display:inline-block;padding:8px 12px;border-radius:999px;background:#e2e8f0;border:0">Reset</button>
        </div>
      </div>

      <div className="card" style={{marginTop:12, padding:16, borderRadius:16, background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
        <div style={{fontSize:18, fontWeight:700, margin:'8px 0'}}>📉 % Giảm (Lỗ) — so với Giá hiện tại</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:14}}>
            <thead><tr><th>% giảm</th><th>Giá sau giảm</th><th>Lỗ vs giá hiện tại (USD)</th><th>PnL vs giá mua (%)</th></tr></thead>
            <tbody>
              {scenarios.map(s => (
                <tr key={'down-'+s.step}>
                  <td>-{s.step}%</td>
                  <td>$ {fmt(s.priceDown)}</td>
                  <td style={{color:'#dc2626'}}>$ {fmt(s.lossUSD)}</td>
                  <td>{pct(s.pnlVsBuyDownPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{marginTop:12, padding:16, borderRadius:16, background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
        <div style={{fontSize:18, fontWeight:700, margin:'8px 0'}}>📈 % Tăng (Lời) — so với Giá hiện tại</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:14}}>
            <thead><tr><th>% tăng</th><th>Giá sau tăng</th><th>Lời vs giá hiện tại (USD)</th><th>PnL vs giá mua (%)</th></tr></thead>
            <tbody>
              {scenarios.map(s => (
                <tr key={'up-'+s.step}>
                  <td>+{s.step}%</td>
                  <td>$ {fmt(s.priceUp)}</td>
                  <td style={{color:'#047857'}}>$ {fmt(s.gainUSD)}</td>
                  <td>{pct(s.pnlVsBuyUpPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{color:'#64748b', fontSize:12, marginTop:8}}>
        iPhone: Safari → Share → Add to Home Screen. App hỗ trợ offline, dữ liệu lưu cục bộ.
      </div>
    </div>
  )
}
