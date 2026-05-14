import { useState, useEffect } from "react"
import { MOCK_LEADERBOARD, scoreColor } from "../constants/data.js"
import axios from "axios"

export default function LeaderboardPage({ currentUserId }) {
  const [board, setBoard]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState("all")   // "all" | "dept"

  useEffect(() => {
    axios.get("/api/leaderboard")
      .then(res => {
        const data = res.data || []
        // Mark current user
        const marked = data.map(u => ({ ...u, isUser: u.userId === currentUserId }))
        setBoard(marked.length > 0 ? marked : getMarkedMock(currentUserId))
      })
      .catch(() => setBoard(getMarkedMock(currentUserId)))
      .finally(() => setLoading(false))
  }, [currentUserId])

  const top3   = board.slice(0, 3)
  const theRest = board.slice(3)
  const userEntry = board.find(u => u.isUser)

  return (
    <div style={{ padding: "48px 20px 20px" }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Campus Board 🏆</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
        {board.length} students this week · ranked by avg kg CO₂/day
      </div>

      {/* Your rank highlight */}
      {userEntry && (
        <div style={{
          margin: "0 0 20px",
          padding: "12px 16px",
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.3)",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 13, color: "#4ade80", fontWeight: 600 }}>Your rank</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              🔥{userEntry.streak} day streak · {userEntry.co2} kg/day avg
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#4ade80" }}>#{userEntry.rank}</div>
        </div>
      )}

      {/* Top 3 podium */}
      {top3.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {top3.map((u, i) => (
            <div key={i} style={{
              flex: 1,
              background: u.isUser ? "rgba(74,222,128,0.1)" : i === 0 ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${u.isUser ? "rgba(74,222,128,0.4)" : i === 0 ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 14, padding: "14px 10px", textAlign: "center",
            }}>
              <div style={{ fontSize: i === 0 ? 26 : 20 }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: u.isUser ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)",
                margin: "8px auto 6px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: u.isUser ? "#4ade80" : "white",
              }}>{u.av}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: u.isUser ? "#4ade80" : "white" }}>{u.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{u.dept}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: scoreColor(u.co2), marginTop: 4 }}>{u.co2}kg</div>
            </div>
          ))}
        </div>
      )}

      {/* Full list */}
      {loading ? (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: 40 }}>Loading leaderboard...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {board.map((u) => (
            <div key={u.rank} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 12,
              background: u.isUser ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${u.isUser ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.06)"}`,
            }}>
              <div style={{
                width: 24, textAlign: "center", fontSize: 13, fontWeight: 700,
                color: u.rank <= 3 ? "#facc15" : "rgba(255,255,255,0.4)",
              }}>#{u.rank}</div>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: u.isUser ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: u.isUser ? "#4ade80" : "white", flexShrink: 0,
              }}>{u.av}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: u.isUser ? 700 : 500, color: u.isUser ? "#4ade80" : "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.name} {u.isUser && <span style={{ fontSize: 11, opacity: 0.7 }}>← You</span>}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {u.dept} · 🔥{u.streak} streak
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: scoreColor(u.co2) }}>{u.co2}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>kg/day</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Improve tip */}
      {userEntry && userEntry.rank > 1 && (
        <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 12 }}>
          <div style={{ fontSize: 13, color: "#a3e635", fontWeight: 600 }}>📈 Improve your rank</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
            You're #{userEntry.rank}. Try a vegetarian meal or cycling to move up tomorrow!
          </div>
        </div>
      )}
    </div>
  )
}

function getMarkedMock(currentUserId) {
  return MOCK_LEADERBOARD.map(u => ({ ...u, isUser: u.isUser || false }))
}
