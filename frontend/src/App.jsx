import { useState, useEffect } from "react"
import { NavBar }          from "./components/UI.jsx"
import Dashboard           from "./components/Dashboard.jsx"
import LogPage             from "./components/LogPage.jsx"
import LeaderboardPage     from "./components/LeaderboardPage.jsx"
import CoachPage           from "./components/CoachPage.jsx"
import LoginPage           from "./components/LoginPage.jsx"
import { calcScore, MOCK_WEEK } from "./constants/data.js"
import axios from "axios"

export default function App() {
  const [user, setUser]       = useState(null)      // null = not logged in
  const [page, setPage]       = useState("dashboard")
  const [weekData, setWeekData] = useState(MOCK_WEEK)
  const [todayLog, setTodayLog] = useState({ meal: "", transport: "", energy: "", logged: false })
  const [streak, setStreak]   = useState(0)         // ← always starts at 0, NO hardcode
  const [loadingUser, setLoadingUser] = useState(true)

  // ── On mount: restore session from localStorage ──────────────────
  useEffect(() => {
    const saved = localStorage.getItem("cc_user")
    if (saved) {
      const parsed = JSON.parse(saved)
      setUser(parsed)
      fetchUserData(parsed.userId)
    } else {
      setLoadingUser(false)
    }
  }, [])

  // ── Fetch real streak + week data from backend ───────────────────
  const fetchUserData = async (userId) => {
    try {
      // Fetch streak from user profile
      const profileRes = await axios.get(`/api/leaderboard/user/${userId}`)
      if (profileRes.data?.streak !== undefined) {
        setStreak(profileRes.data.streak)
      }

      // Fetch last 7 days of logs
      const logsRes = await axios.get(`/api/logs/${userId}/week`)
      if (logsRes.data?.logs?.length > 0) {
        const dbLogs = logsRes.data.logs

        // Build 7-day chart array
        const days = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000)
          const dateStr = d.toISOString().split("T")[0]
          const dayLabel = i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" })
          const found = dbLogs.find(l => l.date === dateStr)
          days.push({ day: dayLabel, co2: found ? found.totalCO2 : 0 })
        }
        setWeekData(days)

        // Restore today's log if already logged today
        const todayStr = new Date().toISOString().split("T")[0]
        const todayEntry = dbLogs.find(l => l.date === todayStr)
        if (todayEntry) {
          setTodayLog({ meal: todayEntry.meal, transport: todayEntry.transport, energy: todayEntry.energy, logged: true })
        }
      }
    } catch {
      // Backend not running — keep defaults (streak 0, mock week data)
    } finally {
      setLoadingUser(false)
    }
  }

  // ── Handle login / register ──────────────────────────────────────
  const handleLogin = (userData) => {
    setUser(userData)
    setStreak(0)           // reset until we load from DB
    fetchUserData(userData.userId)
  }

  // ── Handle logout ────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("cc_user")
    setUser(null)
    setStreak(0)
    setTodayLog({ meal: "", transport: "", energy: "", logged: false })
    setWeekData(MOCK_WEEK)
    setPage("dashboard")
  }

  // ── Handle daily log save ────────────────────────────────────────
  const handleLog = (form, co2) => {
    setTodayLog({ ...form, logged: true })

    // Update today's entry in chart
    const updated = [...weekData]
    updated[6] = { day: "Today", co2: parseFloat(co2.toFixed(2)) }
    setWeekData(updated)

    // Increment streak only if not already logged today
    if (!todayLog.logged) {
      setStreak(s => s + 1)
    }

    setPage("dashboard")
  }

  const todayScore = calcScore(todayLog)
  const weekAvg    = (weekData.reduce((s, d) => s + d.co2, 0) / weekData.length).toFixed(1)

  const wrap = {
    minHeight: "100vh",
    background: "linear-gradient(165deg,#070f1a 0%,#0a1f12 60%,#081510 100%)",
    fontFamily: "Outfit,sans-serif",
    color: "white",
    maxWidth: 430,
    margin: "0 auto",
    paddingBottom: 80,
    position: "relative",
  }

  // Loading splash
  if (loadingUser) {
    return (
      <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 0 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52 }}>🌱</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 12, color: "#4ade80" }}>CampusCarbon</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Loading...</div>
        </div>
      </div>
    )
  }

  // Not logged in — show login/register screen
  if (!user) {
    return (
      <div style={wrap}>
        <LoginPage onLogin={handleLogin} />
      </div>
    )
  }

  // Main app
  return (
    <div style={wrap}>
      {/* Logout button */}
      <button
        onClick={handleLogout}
        title="Logout"
        style={{
          position: "fixed", top: 14, right: 16, zIndex: 200,
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8, padding: "6px 12px", color: "rgba(255,255,255,0.5)",
          fontSize: 12, cursor: "pointer", fontFamily: "Outfit,sans-serif",
        }}
      >
        Logout
      </button>

      {page === "dashboard" && (
        <Dashboard
          user={user}
          todayScore={todayScore}
          weekData={weekData}
          streak={streak}
          todayLogged={todayLog.logged}
          setPage={setPage}
        />
      )}
      {page === "log" && (
        <LogPage
          onLog={handleLog}
          todayLogged={todayLog.logged}
          userId={user.userId}
        />
      )}
      {page === "leaderboard" && (
        <LeaderboardPage currentUserId={user.userId} />
      )}
      {page === "coach" && (
        <CoachPage
          todayScore={todayScore}
          todayLog={todayLog}
          weekAvg={weekAvg}
        />
      )}

      <NavBar page={page} setPage={setPage} />
    </div>
  )
}
