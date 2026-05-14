const express = require("express")
const router  = express.Router()
const User    = require("../models/User")

// GET /api/leaderboard — real leaderboard from MongoDB
router.get("/", async (req, res) => {
  try {
    // Get all users who have at least 1 log, sorted by average CO2 ascending
    const users = await User.find({ logCount: { $gt: 0 } })
      .sort({ totalCO2: 1 })
      .lean()

    const board = users.map((u, i) => ({
      rank:    i + 1,
      userId:  u.userId,
      name:    u.name || "Student",
      dept:    u.dept || "—",
      co2:     parseFloat((u.totalCO2 / u.logCount).toFixed(1)),
      streak:  u.streak || 0,
      av:      (u.name || "ST").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
    }))

    // If DB is empty (fresh install), return seeded mock data
    if (board.length === 0) {
      return res.json(getMockLeaderboard())
    }

    res.json(board)
  } catch (err) {
    console.error("Leaderboard error:", err.message)
    // Fallback to mock on DB error
    res.json(getMockLeaderboard())
  }
})

// POST /api/leaderboard/register — create or update a user profile
router.post("/register", async (req, res) => {
  try {
    const { userId, name, dept, college } = req.body
    if (!userId) return res.status(400).json({ error: "userId is required" })

    const user = await User.findOneAndUpdate(
      { userId },
      { name, dept, college },
      { upsert: true, new: true }
    )
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ error: "Registration failed", details: err.message })
  }
})

// GET /api/leaderboard/user/:userId — get a single user's rank + stats
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).lean()
    if (!user) return res.status(404).json({ error: "User not found" })

    const rank = await User.countDocuments({
      logCount:   { $gt: 0 },
      $expr: { $lt: [{ $divide: ["$totalCO2", "$logCount"] }, user.logCount ? user.totalCO2 / user.logCount : 999] }
    }) + 1

    res.json({ ...user, rank, avgCO2: user.logCount ? parseFloat((user.totalCO2 / user.logCount).toFixed(2)) : 0 })
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user rank", details: err.message })
  }
})

function getMockLeaderboard() {
  return [
    { rank: 1, name: "Priya S.",  dept: "CSE",   co2: 0.7, streak: 18, av: "PS" },
    { rank: 2, name: "Rahul K.",  dept: "MECH",  co2: 0.9, streak: 12, av: "RK" },
    { rank: 3, name: "Ananya R.", dept: "ECE",   co2: 1.1, streak: 9,  av: "AR" },
    { rank: 4, name: "You",       dept: "CSE",   co2: 1.4, streak: 7,  av: "YO", isUser: true },
    { rank: 5, name: "Vikram P.", dept: "CIVIL", co2: 1.6, streak: 5,  av: "VP" },
    { rank: 6, name: "Sneha M.",  dept: "IT",    co2: 1.9, streak: 3,  av: "SM" },
    { rank: 7, name: "Karan T.",  dept: "MBA",   co2: 2.2, streak: 2,  av: "KT" },
  ]
}

module.exports = router
