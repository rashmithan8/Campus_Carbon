import { useState, useRef, useEffect } from "react"
import axios from "axios"

const INITIAL_MSG = {
  role: "assistant",
  content: "Hi! I'm your CampusCarbon AI Coach 🌱\n\nAsk me anything about reducing your footprint — meals, commute, energy. I'll give you personalised tips for campus life!",
}

const QUICK = [
  "How can I reduce my commute emissions?",
  "What's the lowest CO₂ meal option?",
  "Tips for saving energy in my hostel room?",
  "How do I reach the campus top 3?",
]

export default function CoachPage({ todayScore, todayLog, weekAvg }) {
  const [messages, setMessages] = useState([INITIAL_MSG])
  const [input, setInput]       = useState("")
  const [loading, setLoading]   = useState(false)
  const chatEnd = useRef(null)

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    const updated = [...messages, { role: "user", content: msg }]
    setMessages(updated)
    setInput("")
    setLoading(true)
    try {
      const res = await axios.post("/api/coach", {
        messages: updated,
        context: { todayScore, todayLog, weekAvg },
      })
      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! Couldn't reach the AI server. Make sure the backend is running." }])
    }
    setLoading(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "48px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>AI Coach 🤖</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
          Powered by Claude · Your personal sustainability advisor
        </div>
      </div>

      {/* Quick prompts */}
      <div style={{ padding: "12px 16px 0", display: "flex", gap: 8, overflowX: "auto", flexShrink: 0 }}>
        {QUICK.map((q, i) => (
          <button key={i} onClick={() => send(q)} style={{
            whiteSpace: "nowrap", padding: "7px 14px",
            background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)",
            borderRadius: 20, color: "#a3e635", fontSize: 12, cursor: "pointer", fontFamily: "Outfit,sans-serif",
          }}>
            {q}
          </button>
        ))}
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "rgba(74,222,128,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: "flex-end",
              }}>🌱</div>
            )}
            <div style={{
              maxWidth: "78%", padding: "11px 15px",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${m.role === "user" ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)"}`,
              fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.9)", whiteSpace: "pre-wrap",
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(74,222,128,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>🌱</div>
            <div style={{
              padding: "11px 15px", background: "rgba(255,255,255,0.06)",
              borderRadius: "16px 16px 16px 4px", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#4ade80",
                    animation: `bounce 1s ${j * 0.2}s infinite`, opacity: 0.6,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEnd} />
      </div>

      {/* Input bar */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about reducing your footprint..."
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12, padding: "12px 16px",
            color: "white", fontSize: 14, fontFamily: "Outfit,sans-serif", outline: "none",
          }}
        />
        <button onClick={() => send()} disabled={loading} style={{
          width: 46, height: 46, borderRadius: 12,
          background: loading ? "rgba(74,222,128,0.4)" : "#4ade80",
          border: "none", cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#071a0e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }`}</style>
    </div>
  )
}
