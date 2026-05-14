import { useState } from "react"
import axios from "axios"

export default function LoginPage({ onLogin }) {
  const [mode, setMode]         = useState("login")
  const [form, setForm]         = useState({ userId: "", password: "", confirmPassword: "", name: "", dept: "", college: "" })
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError("")
    const userId = form.userId.trim().toLowerCase().replace(/\s+/g, "_")

    // Validation
    if (!userId)             { setError("Username is required."); return }
    if (!form.password)      { setError("Password is required."); return }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return }
    if (mode === "register") {
      if (!form.name.trim()) { setError("Full name is required."); return }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return }
    }

    setLoading(true)
    try {
      if (mode === "register") {
        const res = await axios.post("/api/auth/register", {
          userId,
          password: form.password,
          name:     form.name.trim(),
          dept:     form.dept.trim() || "General",
          college:  form.college.trim() || "My College",
        })
        onLogin(res.data.user)
      } else {
        const res = await axios.post("/api/auth/login", {
          userId,
          password: form.password,
        })
        onLogin(res.data.user)
      }
    } catch (err) {
      setError(err.response?.data?.error || "Could not connect to server. Make sure the backend is running.")
    }
    setLoading(false)
  }

  const inputStyle = {
    width: "100%", padding: "13px 16px", marginBottom: 12,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 12, color: "white",
    fontSize: 15, fontFamily: "Outfit,sans-serif", outline: "none",
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 24px" }}>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 56 }}>🌱</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>CampusCarbon</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
          Track your footprint. Beat your campus.
        </div>
      </div>

      {/* Tab toggle */}
      <div style={{
        display: "flex", width: "100%", maxWidth: 360,
        background: "rgba(255,255,255,0.05)", borderRadius: 12,
        padding: 4, marginBottom: 24, gap: 4,
      }}>
        {["login", "register"].map(m => (
          <button key={m} onClick={() => { setMode(m); setError("") }} style={{
            flex: 1, padding: "10px 0",
            background: mode === m ? "rgba(74,222,128,0.18)" : "none",
            border: mode === m ? "1px solid rgba(74,222,128,0.4)" : "1px solid transparent",
            borderRadius: 10,
            color: mode === m ? "#4ade80" : "rgba(255,255,255,0.45)",
            fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit,sans-serif",
          }}>
            {m === "login" ? "🔑 Login" : "✨ Register"}
          </button>
        ))}
      </div>

      {/* Form */}
      <div style={{ width: "100%", maxWidth: 360 }}>

        {/* Username */}
        <input
          placeholder="Username  (e.g. rahul_cse)"
          value={form.userId}
          onChange={e => set("userId", e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          style={inputStyle}
        />

        {/* Register-only fields */}
        {mode === "register" && (
          <>
            <input
              placeholder="Full name  (e.g. Rahul Kumar)"
              value={form.name}
              onChange={e => set("name", e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Department  (e.g. CSE, ECE, MBA)"
              value={form.dept}
              onChange={e => set("dept", e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="College name"
              value={form.college}
              onChange={e => set("college", e.target.value)}
              style={inputStyle}
            />
          </>
        )}

        {/* Password */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input
            placeholder="Password  (min. 6 characters)"
            value={form.password}
            onChange={e => set("password", e.target.value)}
            type={showPass ? "text" : "password"}
            style={{ ...inputStyle, marginBottom: 0, paddingRight: 48 }}
          />
          <button
            onClick={() => setShowPass(s => !s)}
            style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.4)", fontSize: 16,
            }}
          >
            {showPass ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Confirm password — register only */}
        {mode === "register" && (
          <input
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={e => set("confirmPassword", e.target.value)}
            type={showPass ? "text" : "password"}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={inputStyle}
          />
        )}

        {/* Error message */}
        {error && (
          <div style={{
            color: "#f87171", fontSize: 13, marginBottom: 14,
            padding: "10px 14px", background: "rgba(248,113,113,0.08)",
            borderRadius: 10, border: "1px solid rgba(248,113,113,0.2)",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "15px",
            background: loading ? "rgba(74,222,128,0.4)" : "linear-gradient(135deg,#4ade80,#22c55e)",
            border: "none", borderRadius: 14,
            color: "#071a0e", fontSize: 16, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "Outfit,sans-serif",
          }}
        >
          {loading ? "Please wait..." : mode === "login" ? "Login →" : "Create Account →"}
        </button>

        {/* Switch mode */}
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          {mode === "login" ? (
            <>New here?{" "}
              <span onClick={() => { setMode("register"); setError("") }}
                style={{ color: "#4ade80", cursor: "pointer", fontWeight: 600 }}>
                Register
              </span>
            </>
          ) : (
            <>Already have an account?{" "}
              <span onClick={() => { setMode("login"); setError("") }}
                style={{ color: "#4ade80", cursor: "pointer", fontWeight: 600 }}>
                Login
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
