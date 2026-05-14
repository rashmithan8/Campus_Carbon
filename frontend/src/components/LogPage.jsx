import { useState } from "react"
import { Card } from "./UI.jsx"
import { CARBON_FACTORS, calcScore, scoreColor, scoreLabel } from "../constants/data.js"
import axios from "axios"

const DEFAULT_CUSTOM = { meal: [], transport: [], energy: [] }

export default function LogPage({ onLog, todayLogged, userId }) {
  const [form, setForm]         = useState({ meal: "", transport: "", energy: "" })
  const [formErr, setFormErr]   = useState("")
  const [saving, setSaving]     = useState(false)

  // Custom options state: { meal: [{label, co2}], transport: [...], energy: [...] }
  const [custom, setCustom]     = useState(DEFAULT_CUSTOM)
  const [addingFor, setAddingFor] = useState(null)   // "meal" | "transport" | "energy" | null
  const [customLabel, setCustomLabel] = useState("")
  const [customCO2, setCustomCO2]     = useState("")
  const [customErr, setCustomErr]     = useState("")

  // Build combined options: defaults + user customs
  const allOptions = (field) => {
    const key = field === "meal" ? "meals" : field
    const defaults = Object.entries(CARBON_FACTORS[key] ?? CARBON_FACTORS[field] ?? {})
      .map(([label, co2]) => ({ label, co2 }))
    return [...defaults, ...(custom[field] || [])]
  }

  const preview = (() => {
    const getVal = (field) => {
      const key = field === "meal" ? "meals" : field
      const def = (CARBON_FACTORS[key] ?? CARBON_FACTORS[field])?.[form[field]]
      if (def !== undefined) return def
      return custom[field]?.find(c => c.label === form[field])?.co2 ?? 0
    }
    return getVal("meal") + getVal("transport") + getVal("energy")
  })()

  const handleAddCustom = () => {
    if (!customLabel.trim()) { setCustomErr("Please enter a name."); return }
    const val = parseFloat(customCO2)
    if (isNaN(val) || val < 0) { setCustomErr("Enter a valid CO₂ value (e.g. 1.5)"); return }
    setCustom(c => ({ ...c, [addingFor]: [...(c[addingFor] || []), { label: customLabel.trim(), co2: val }] }))
    setForm(f => ({ ...f, [addingFor]: customLabel.trim() }))
    setCustomLabel("")
    setCustomCO2("")
    setCustomErr("")
    setAddingFor(null)
  }

  const handleLog = async () => {
    if (!form.meal || !form.transport || !form.energy) {
      setFormErr("Please fill all fields to log your day.")
      return
    }
    setSaving(true)
    try {
      await axios.post("/api/logs", {
        userId: userId || "demo_user",
        date: new Date().toISOString().split("T")[0],
        meal: form.meal,
        transport: form.transport,
        energy: form.energy,
        totalCO2: preview,
      })
    } catch {
      // offline fallback — still update UI
    }
    onLog(form, preview)
    setFormErr("")
    setSaving(false)
  }

  const fields = [
    { key: "meal",      label: "🍽️ What did you eat today?" },
    { key: "transport", label: "🚌 How did you commute?" },
    { key: "energy",    label: "⚡ Your energy usage today?" },
  ]

  return (
    <div style={{ padding: "48px 20px 20px" }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Log Today 📋</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
        Track your habits to see your impact
      </div>

      {fields.map(({ key, label }) => (
        <div key={key} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "rgba(255,255,255,0.8)" }}>{label}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {allOptions(key).map(({ label: opt, co2 }) => {
              const sel = form[key] === opt
              return (
                <button key={opt} onClick={() => setForm(f => ({ ...f, [key]: opt }))} style={{
                  padding: "8px 14px", borderRadius: 10,
                  border: `1px solid ${sel ? "#4ade80" : "rgba(255,255,255,0.15)"}`,
                  background: sel ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.04)",
                  color: sel ? "#4ade80" : "rgba(255,255,255,0.7)",
                  fontSize: 13, cursor: "pointer", fontFamily: "Outfit,sans-serif",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {opt}
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: co2 === 0 ? "#4ade80" : co2 < 1 ? "#a3e635" : co2 < 2 ? "#facc15" : "#f87171",
                  }}>{co2}kg</span>
                </button>
              )
            })}

            {/* Add custom button */}
            <button onClick={() => { setAddingFor(key); setCustomErr("") }} style={{
              padding: "8px 14px", borderRadius: 10,
              border: "1px dashed rgba(74,222,128,0.4)",
              background: "rgba(74,222,128,0.05)",
              color: "rgba(74,222,128,0.7)",
              fontSize: 13, cursor: "pointer", fontFamily: "Outfit,sans-serif",
            }}>
              + Custom
            </button>
          </div>

          {/* Inline custom option form */}
          {addingFor === key && (
            <div style={{
              marginTop: 12, padding: "14px 16px",
              background: "rgba(74,222,128,0.07)",
              border: "1px solid rgba(74,222,128,0.25)", borderRadius: 12,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#a3e635", marginBottom: 10 }}>
                Add custom {key} option
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  placeholder={`Name (e.g. ${key === "meal" ? "Paneer Biryani" : key === "transport" ? "E-scooter" : "Solar-powered"})`}
                  value={customLabel}
                  onChange={e => setCustomLabel(e.target.value)}
                  style={{
                    flex: 2, padding: "10px 13px",
                    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10, color: "white", fontSize: 13, fontFamily: "Outfit,sans-serif", outline: "none",
                  }}
                />
                <input
                  placeholder="kg CO₂"
                  value={customCO2}
                  onChange={e => setCustomCO2(e.target.value)}
                  type="number"
                  min="0"
                  step="0.1"
                  style={{
                    flex: 1, padding: "10px 13px",
                    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10, color: "white", fontSize: 13, fontFamily: "Outfit,sans-serif", outline: "none",
                  }}
                />
              </div>
              {customErr && <div style={{ fontSize: 12, color: "#f87171", marginBottom: 8 }}>{customErr}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleAddCustom} style={{
                  flex: 1, padding: "9px", background: "#4ade80", border: "none",
                  borderRadius: 10, color: "#071a0e", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "Outfit,sans-serif",
                }}>Add & Select</button>
                <button onClick={() => { setAddingFor(null); setCustomErr("") }} style={{
                  padding: "9px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer",
                  fontFamily: "Outfit,sans-serif",
                }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Live preview */}
      {form.meal && form.transport && form.energy && (
        <Card style={{ marginBottom: 20, borderColor: "rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.07)" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Today's estimated footprint</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: scoreColor(preview) }}>
            {preview.toFixed(1)} <span style={{ fontSize: 14, fontWeight: 400 }}>kg CO₂</span>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            {scoreLabel(preview)} —{" "}
            {preview < 1.5 ? "Great job, keep it up! 🌟" : preview < 2.5 ? "Decent! A few swaps could help." : "Consider greener alternatives tomorrow."}
          </div>
        </Card>
      )}

      {formErr && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{formErr}</div>}

      <button onClick={handleLog} disabled={saving} style={{
        width: "100%", padding: "15px",
        background: "linear-gradient(135deg,#4ade80,#22c55e)",
        border: "none", borderRadius: 14,
        color: "#071a0e", fontSize: 16, fontWeight: 700,
        cursor: saving ? "not-allowed" : "pointer",
        fontFamily: "Outfit,sans-serif", opacity: saving ? 0.7 : 1,
      }}>
        {saving ? "Saving..." : "✅ Save Today's Log"}
      </button>

      {todayLogged && (
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#4ade80" }}>
          ✓ Today already logged! Saving will update your score.
        </div>
      )}
    </div>
  )
}
