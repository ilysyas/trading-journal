import { useState, useEffect, useRef } from "react";

const INSTRUMENTS = ["XAUUSD", "NQ", "EURUSD", "CRYPTO", "OTHER"];
const CONCEPTS = ["FVG", "IFVG", "OB", "BOS", "CHOCH", "CISD", "SMT", "Liquidity Sweep", "MSS", "PDH/PDL", "NWOG", "Other"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

const emptyDay = () => ({
  result: null,
  instrument: "",
  bias: "",
  entry: "",
  exit: "",
  entryTime: "",
  exitTime: "",
  pips: "",
  pnl: "",
  currency: "USD",
  concepts: [],
  notes: "",
  whyFailed: "",
  couldDoBetter: "",
  screenshots: [],
});

const resultColor = (r) =>
  r === "win" ? "#00d68f" : r === "loss" ? "#ff4757" : r === "be" ? "#ffa502" : null;
const resultLabel = (r) =>
  r === "win" ? "W" : r === "loss" ? "L" : r === "be" ? "BE" : "";

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [showWeekends, setShowWeekends] = useState(false);
  const [days, setDays] = useState({});
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("calendar");
  const fileRef = useRef();

  const storageKey = `tj-${year}-${month}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setDays(saved ? JSON.parse(saved) : {});
    } catch { setDays({}); }
  }, [year, month, storageKey]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(days)); } catch {}
  }, [days, storageKey]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const getDay = (d) => days[d] || emptyDay();
  const setDay = (d, data) => setDays(prev => ({ ...prev, [d]: data }));
  const updateField = (field, value) => setDay(selected, { ...getDay(selected), [field]: value });
  const toggleConcept = (c) => {
    const cur = getDay(selected).concepts || [];
    updateField("concepts", cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]);
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const openDay = (d) => {
    if (!days[d]) setDay(d, emptyDay());
    setSelected(d);
    setView("day");
  };

  const allDayData = Object.values(days);
  const wins = allDayData.filter(d => d.result === "win").length;
  const losses = allDayData.filter(d => d.result === "loss").length;
  const bes = allDayData.filter(d => d.result === "be").length;
  const total = wins + losses + bes;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const totalPnl = allDayData.reduce((s, d) => s + (parseFloat(d.pnl) || 0), 0);

  const cols = showWeekends ? 7 : 5;
  const dayNames = showWeekends
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const handleScreenshot = (e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setDay(selected, {
          ...getDay(selected),
          screenshots: [...(getDay(selected).screenshots || []), { name: file.name, data: ev.target.result }]
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // ── DAY DETAIL VIEW ──
  if (view === "day" && selected) {
    const d = getDay(selected);
    return (
      <div style={{ background: "#0d0d0d", minHeight: "100vh" }}>
        <div style={{ background: "#111", borderBottom: "1px solid #1e1e1e", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
          <div>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.2em" }}>TRADE LOG</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", fontFamily: "Syne, sans-serif" }}>
              {MONTHS[month]} {selected}, {year}
            </div>
          </div>
          <button onClick={() => setView("calendar")} style={btnStyle("#d4a843", "#d4a84333")}>← Calendar</button>
        </div>

        <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 20px 60px" }}>

          {/* Result */}
          <Section label="RESULT">
            <div style={{ display: "flex", gap: 10 }}>
              {[["win","WIN","#00d68f"],["loss","LOSS","#ff4757"],["be","BREAK EVEN","#ffa502"]].map(([val, label, color]) => (
                <button key={val} onClick={() => updateField("result", d.result === val ? null : val)}
                  style={{ padding: "10px 22px", borderRadius: 8, border: `2px solid ${d.result === val ? color : "#222"}`, background: d.result === val ? color + "22" : "transparent", color: d.result === val ? color : "#444", fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.1em" }}>
                  {label}
                </button>
              ))}
            </div>
          </Section>

          {/* Instrument + Bias */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <Section label="INSTRUMENT">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {INSTRUMENTS.map(ins => (
                  <button key={ins} onClick={() => updateField("instrument", d.instrument === ins ? "" : ins)}
                    style={{ padding: "5px 13px", borderRadius: 6, border: `1px solid ${d.instrument === ins ? "#d4a843" : "#222"}`, background: d.instrument === ins ? "#d4a84322" : "transparent", color: d.instrument === ins ? "#d4a843" : "#555", fontFamily: "inherit", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                    {ins}
                  </button>
                ))}
              </div>
            </Section>
            <Section label="BIAS OF THE DAY">
              <div style={{ display: "flex", gap: 8 }}>
                {[["Bullish","#00d68f"],["Bearish","#ff4757"],["Neutral","#888"]].map(([b, color]) => (
                  <button key={b} onClick={() => updateField("bias", d.bias === b ? "" : b)}
                    style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid ${d.bias === b ? color : "#222"}`, background: d.bias === b ? color + "22" : "transparent", color: d.bias === b ? color : "#555", fontFamily: "inherit", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                    {b}
                  </button>
                ))}
              </div>
            </Section>
          </div>

          {/* Entry / Exit */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
            {[
              { label: "ENTRY PRICE", field: "entry", placeholder: "e.g. 2345.50" },
              { label: "EXIT PRICE", field: "exit", placeholder: "e.g. 2360.00" },
              { label: "ENTRY TIME (NYC)", field: "entryTime", placeholder: "e.g. 09:30" },
              { label: "EXIT TIME (NYC)", field: "exitTime", placeholder: "e.g. 10:45" },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <FieldLabel>{label}</FieldLabel>
                <Input value={d[field] || ""} onChange={e => updateField(field, e.target.value)} placeholder={placeholder} />
              </div>
            ))}
          </div>

          {/* PnL row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
            {[
              { label: "PIPS / POINTS", field: "pips", placeholder: "e.g. 150" },
              { label: "P&L ($)", field: "pnl", placeholder: "e.g. +320" },
              { label: "CURRENCY", field: "currency", placeholder: "USD" },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <FieldLabel>{label}</FieldLabel>
                <Input value={d[field] || ""} onChange={e => updateField(field, e.target.value)} placeholder={placeholder} />
              </div>
            ))}
          </div>

          {/* Concepts */}
          <Section label="CONCEPTS USED">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CONCEPTS.map(c => (
                <button key={c} onClick={() => toggleConcept(c)}
                  style={{ padding: "5px 13px", borderRadius: 20, border: `1px solid ${(d.concepts || []).includes(c) ? "#d4a843" : "#1e1e1e"}`, background: (d.concepts || []).includes(c) ? "#d4a84322" : "transparent", color: (d.concepts || []).includes(c) ? "#d4a843" : "#444", fontFamily: "inherit", fontSize: 10, cursor: "pointer" }}>
                  {c}
                </button>
              ))}
            </div>
          </Section>

          {/* Text areas */}
          {[
            { label: "NOTES / TRADE ANALYSIS", field: "notes", placeholder: "What happened? What did you think going in?" },
            { label: "WHY DID IT FAIL / WHAT WENT WRONG", field: "whyFailed", placeholder: "If it was a loss — what was the reason?" },
            { label: "WHAT COULD I HAVE DONE BETTER", field: "couldDoBetter", placeholder: "Improvements, lessons, adjustments..." },
          ].map(({ label, field, placeholder }) => (
            <div key={field} style={{ marginBottom: 16 }}>
              <FieldLabel>{label}</FieldLabel>
              <textarea value={d[field] || ""} onChange={e => updateField(field, e.target.value)} placeholder={placeholder} rows={3}
                style={{ width: "100%", background: "#161616", border: "1px solid #1e1e1e", borderRadius: 8, color: "#e0e0e0", fontFamily: "inherit", fontSize: 11, padding: "10px 12px", resize: "vertical", lineHeight: 1.7, outline: "none" }} />
            </div>
          ))}

          {/* Screenshots */}
          <Section label="SCREENSHOTS">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {(d.screenshots || []).map((sc, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={sc.data} alt={sc.name} style={{ width: 150, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #222", display: "block" }} />
                  <button onClick={() => updateField("screenshots", (d.screenshots || []).filter((_, j) => j !== i))}
                    style={{ position: "absolute", top: 5, right: 5, background: "#ff4757", border: "none", borderRadius: "50%", width: 20, height: 20, color: "#fff", cursor: "pointer", fontSize: 13, lineHeight: "20px", textAlign: "center" }}>×</button>
                </div>
              ))}
              <button onClick={() => fileRef.current.click()}
                style={{ width: 150, height: 100, border: "1px dashed #2a2a2a", borderRadius: 8, background: "transparent", color: "#333", cursor: "pointer", fontFamily: "inherit", fontSize: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, letterSpacing: "0.1em" }}>
                <span style={{ fontSize: 22 }}>+</span>
                ADD SCREENSHOT
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleScreenshot} style={{ display: "none" }} />
            </div>
          </Section>

        </div>
      </div>
    );
  }

  // ── CALENDAR VIEW ──
  // Build grid cells
  const fullGrid = [];
  for (let i = 0; i < firstDay; i++) fullGrid.push({ d: null, col: i % 7 });
  for (let d = 1; d <= daysInMonth; d++) {
    fullGrid.push({ d, col: (firstDay + d - 1) % 7 });
  }
  const visibleCells = showWeekends ? fullGrid : fullGrid.filter(c => c.col < 5);

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: "#111", borderBottom: "1px solid #1a1a1a", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.2em" }}>ELIAS VIGIGI</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "Syne, sans-serif", letterSpacing: "-0.01em" }}>Trading Journal</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {/* Weekend toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, color: "#444", letterSpacing: "0.15em" }}>WEEKENDS</span>
            <div onClick={() => setShowWeekends(w => !w)} style={{ width: 38, height: 21, borderRadius: 11, background: showWeekends ? "#00d68f" : "#222", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: showWeekends ? 19 : 3, width: 15, height: 15, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
            </div>
          </div>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={prevMonth} style={btnStyle("#666", "#1a1a1a")}>‹</button>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", minWidth: 140, textAlign: "center" }}>{MONTHS[month]} {year}</div>
            <button onClick={nextMonth} style={btnStyle("#666", "#1a1a1a")}>›</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 28, padding: "14px 24px", borderBottom: "1px solid #141414", flexWrap: "wrap" }}>
        {[
          { label: "WIN RATE", val: `${winRate}%`, color: winRate >= 50 ? "#00d68f" : "#ff4757" },
          { label: "WINS", val: wins, color: "#00d68f" },
          { label: "LOSSES", val: losses, color: "#ff4757" },
          { label: "BREAK EVEN", val: bes, color: "#ffa502" },
          { label: "TOTAL P&L", val: `${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(0)}`, color: totalPnl >= 0 ? "#00d68f" : "#ff4757" },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 9, color: "#3a3a3a", letterSpacing: "0.15em", marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "Syne, sans-serif" }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div style={{ padding: "18px 20px" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6, marginBottom: 6 }}>
          {dayNames.map(n => (
            <div key={n} style={{ fontSize: 9, color: "#333", letterSpacing: "0.15em", textAlign: "center", padding: "2px 0 6px" }}>{n}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6 }}>
          {visibleCells.map((cell, i) => {
            const { d } = cell;
            const dayData = d ? getDay(d) : null;
            const r = dayData?.result;
            const pnl = d ? parseFloat(dayData?.pnl) : null;
            const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            return (
              <div key={i} onClick={() => d && openDay(d)}
                style={{
                  background: r ? resultColor(r) + "15" : d ? "#111" : "transparent",
                  border: `1px solid ${r ? resultColor(r) + "44" : d ? "#1a1a1a" : "transparent"}`,
                  borderRadius: 9,
                  minHeight: 72,
                  padding: "8px 10px",
                  cursor: d ? "pointer" : "default",
                  position: "relative",
                  outline: isToday ? "1px solid #d4a84377" : "none",
                  transition: "transform 0.1s, background 0.1s",
                }}>
                {d && <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: r ? resultColor(r) : "#2a2a2a" }}>{d}</div>
                  {r && <div style={{ position: "absolute", top: 7, right: 8, fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: resultColor(r), background: resultColor(r) + "22", padding: "2px 5px", borderRadius: 4 }}>{resultLabel(r)}</div>}
                  {dayData?.instrument && <div style={{ fontSize: 9, color: "#444", marginTop: 3 }}>{dayData.instrument}</div>}
                  {pnl !== null && !isNaN(pnl) && pnl !== 0 && <div style={{ fontSize: 10, fontWeight: 700, color: pnl >= 0 ? "#00d68f" : "#ff4757", marginTop: 2 }}>{pnl >= 0 ? "+" : ""}{pnl}</div>}
                  {isToday && <div style={{ position: "absolute", bottom: 7, right: 8, width: 5, height: 5, borderRadius: "50%", background: "#d4a843" }} />}
                </>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 18, padding: "4px 22px 24px", flexWrap: "wrap" }}>
        {[["#00d68f","Win"],["#ff4757","Loss"],["#ffa502","Break Even"],["#d4a843","Today"]].map(([color, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 9, color: "#333", letterSpacing: "0.1em" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Small helpers ──
function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}
function FieldLabel({ children }) {
  return <div style={{ fontSize: 9, color: "#3a3a3a", letterSpacing: "0.15em", marginBottom: 7 }}>{children}</div>;
}
function Input({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: "100%", background: "#161616", border: "1px solid #1e1e1e", borderRadius: 7, color: "#e0e0e0", fontFamily: "inherit", fontSize: 11, padding: "8px 10px", outline: "none" }} />
  );
}
function btnStyle(color, bg) {
  return { background: bg, border: `1px solid #222`, borderRadius: 7, color, padding: "7px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 13 };
}
