import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, Stat, Ring } from "./UI.jsx"
import { TIPS, ACHIEVEMENTS, MOCK_WEEK } from "../constants/data.js"

export default function Dashboard({ user, todayScore, weekData, streak, todayLogged, setPage }) {
  const weekAvg = (weekData.reduce((s, d) => s + d.co2, 0) / weekData.length).toFixed(1)
  const totalSaved = Math.max(0, (2.55 - parseFloat(weekAvg)) * 7).toFixed(1)
  const tipIndex = Math.floor(Math.random() * TIPS.length)

  // Compute which achievements are done (simple heuristic for demo)
  const doneBadges = { first_log: todayLogged, streak_7: streak >= 7 }

  return (
    <div style={{ padding: "0 0 16px" }}>
      {/* Header */}
      <div style={{ padding: "48px 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: 1, textTransform: "uppercase" }}>
            Campus Carbon
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>Good morning, {user?.name?.split(" ")[0] || "Student"} 👋</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#4ade80" }}>🔥{streak}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>day streak</div>
        </div>
      </div>

      {/* Log reminder banner */}
      {!todayLogged && (
        <div style={{
          margin: "0 16px 16px",
          background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
          borderRadius: 12, padding: "12px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 13, color: "#a3e635" }}>📋 You haven't logged today yet!</span>
          <button onClick={() => setPage("log")} style={{
            background: "#4ade80", color: "#0a1f12", border: "none",
            borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>Log Now</button>
        </div>
      )}

      {/* Score ring */}
      <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 4px" }}>
        <Ring score={todayScore} />
      </div>

      {/* Stats row */}
      <div style={{
        display: "flex", justifyContent: "space-around", margin: "8px 20px 20px",
        background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "14px 8px",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Stat label="Week avg"    value={weekAvg}    unit="kg/day" color="#facc15" />
        <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
        <Stat label="CO₂ Saved"  value={totalSaved} unit="kg"     color="#4ade80" />
        <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
        <Stat label="Campus rank" value="#4"         unit=""       color="#a78bfa" />
      </div>

      {/* Weekly trend chart */}
      <div style={{ padding: "0 16px 16px" }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 12, letterSpacing: 0.5 }}>
            WEEKLY TREND
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={weekData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0d2818", border: "1px solid #4ade80", borderRadius: 8, color: "white", fontSize: 12 }}
                formatter={(v) => [`${v} kg CO₂`, ""]}
              />
              <Area type="monotone" dataKey="co2" stroke="#4ade80" strokeWidth={2}
                fill="url(#areaGrad)" dot={{ fill: "#4ade80", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Daily tip */}
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: 0.5 }}>
          💡 TODAY'S TIP
        </div>
        <Card style={{ borderColor: "rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.05)" }}>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.85)" }}>{TIPS[tipIndex]}</div>
        </Card>
      </div>

      {/* Achievements */}
      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: 0.5 }}>
          🏅 ACHIEVEMENTS
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {ACHIEVEMENTS.map((a) => {
            const done = !!doneBadges[a.key]
            return (
              <Card key={a.key} style={{
                textAlign: "center", padding: "12px 8px",
                opacity: done ? 1 : 0.4,
                borderColor: done ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: 22 }}>{a.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: done ? "#4ade80" : "white" }}>{a.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{a.desc}</div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
