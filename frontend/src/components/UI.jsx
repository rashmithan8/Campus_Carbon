import { scoreColor, scoreLabel } from '../constants/data.js'

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(74,222,128,0.12)",
      borderRadius: 16,
      padding: "16px 18px",
      ...style,
    }}>
      {children}
    </div>
  )
}

export function Stat({ label, value, unit, color = "white" }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>
        {value}
        <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2, color: "rgba(255,255,255,0.5)" }}>{unit}</span>
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{label}</div>
    </div>
  )
}

export function Ring({ score }) {
  const r = 56
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(score / 5, 1))
  const col = scoreColor(score)
  return (
    <svg width="148" height="148" viewBox="0 0 148 148">
      <circle cx="74" cy="74" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="13" />
      <circle
        cx="74" cy="74" r={r} fill="none" stroke={col} strokeWidth="13"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 74 74)"
        style={{ transition: "all 0.9s ease" }}
      />
      <text x="74" y="65" textAnchor="middle" fill="white" fontSize="28" fontWeight="700" fontFamily="Outfit,sans-serif">
        {score.toFixed(1)}
      </text>
      <text x="74" y="82" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Outfit,sans-serif">
        kg CO₂ today
      </text>
      <text x="74" y="100" textAnchor="middle" fill={col} fontSize="13" fontWeight="600" fontFamily="Outfit,sans-serif">
        {scoreLabel(score)}
      </text>
    </svg>
  )
}

export function NavBar({ page, setPage }) {
  const items = [
    { id: "dashboard",   label: "Home",     path: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" },
    { id: "log",         label: "Log",      path: "M12 5v14 M5 12h14" },
    { id: "leaderboard", label: "Board",    path: "M18 20V10 M12 20V4 M6 20v-6" },
    { id: "coach",       label: "AI Coach", path: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  ]
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430,
      background: "rgba(8,22,14,0.97)", backdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(74,222,128,0.15)",
      display: "flex", zIndex: 100,
    }}>
      {items.map(it => (
        <button
          key={it.id}
          onClick={() => setPage(it.id)}
          style={{
            flex: 1, padding: "10px 0 8px",
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={page === it.id ? "#4ade80" : "rgba(255,255,255,0.4)"}
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {it.path.split(" M").map((d, i) => <path key={i} d={(i === 0 ? "" : "M") + d} />)}
          </svg>
          <span style={{
            fontSize: 10, fontFamily: "Outfit,sans-serif",
            color: page === it.id ? "#4ade80" : "rgba(255,255,255,0.4)",
            fontWeight: page === it.id ? 600 : 400,
          }}>{it.label}</span>
        </button>
      ))}
    </div>
  )
}
