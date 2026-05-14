require("dotenv").config()

const express  = require("express")
const cors     = require("cors")
const mongoose = require("mongoose")

const logsRoute        = require("./routes/logs")
const leaderboardRoute = require("./routes/leaderboard")
const coachRoute       = require("./routes/coach")
const authRoute        = require("./routes/auth")

const app  = express()
const PORT = process.env.PORT || 5000

// ── MongoDB Connection ───────────────────────────────────────────────
const connectDB = async () => {
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("your_password")) {
    console.warn("⚠️  MONGODB_URI not set — logs will NOT be saved persistently!")
    console.warn("   Add your MongoDB Atlas URI to backend/.env to enable persistence.")
    return
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ MongoDB connected successfully")
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message)
    console.error("   Check your MONGODB_URI in backend/.env")
    process.exit(1)
  }
}

connectDB()

// ── Middleware ───────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}))
app.use(express.json())

// ── Health check ─────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status:         "ok",
    service:        "CampusCarbon API",
    timestamp:      new Date().toISOString(),
    database:       mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    groqKeySet:     !!(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith("gsk_xxx")),
    mongoKeySet:    !!(process.env.MONGODB_URI && !process.env.MONGODB_URI.includes("your_password")),
  })
})

// ── Routes ───────────────────────────────────────────────────────────
app.use("/api/auth",        authRoute)
app.use("/api/logs",        logsRoute)
app.use("/api/leaderboard", leaderboardRoute)
app.use("/api/coach",       coachRoute)

// ── 404 ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// ── Error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ error: "Internal server error" })
})

// ── Start ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║         🌱 CampusCarbon API                ║
║   Server running on http://localhost:${PORT}   ║
║   Health: http://localhost:${PORT}/api/health  ║
╚════════════════════════════════════════════╝
  `)
})
