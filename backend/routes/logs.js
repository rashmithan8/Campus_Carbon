const express = require("express")
const router  = express.Router()
const Log     = require("../models/Log")
const User    = require("../models/User")

// ── Carbon emission factors (mirrors frontend constants) ─────────────
const CARBON_FACTORS = {
  meals:     { "Vegetarian": 0.5, "Eggs / Dairy": 1.2, "Chicken": 2.5, "Fish": 1.8, "Beef / Mutton": 6.0 },
  transport: { "Walking": 0, "Cycling": 0, "College Bus": 0.3, "City Bus / Metro": 0.8, "Auto-rickshaw": 1.5, "Cab (Ola/Uber)": 2.2, "Bike (own)": 0.6, "Car": 3.5 },
  energy:    { "Very low (no AC)": 0.2, "Low (fan only)": 0.4, "Medium (AC < 4 hrs)": 0.9, "High (AC all day)": 1.6 },
}

// POST /api/logs — save or update a daily log entry
router.post("/", async (req, res) => {
  try {
    const { userId, date, meal, transport, energy, totalCO2 } = req.body

    if (!userId || !date || !meal || !transport || !energy) {
      return res.status(400).json({ error: "Missing required fields: userId, date, meal, transport, energy" })
    }

    const co2 = parseFloat(totalCO2) ||
      (CARBON_FACTORS.meals[meal] || 0) +
      (CARBON_FACTORS.transport[transport] || 0) +
      (CARBON_FACTORS.energy[energy] || 0)

    // Upsert: update if log exists for this date, insert if not
    const log = await Log.findOneAndUpdate(
      { userId, date },
      { meal, transport, energy, totalCO2: co2, loggedAt: new Date() },
      { upsert: true, new: true, runValidators: true }
    )

    // Update user stats — recalculate from all logs
    const allLogs    = await Log.find({ userId }).sort({ date: 1 })
    const totalCO2_  = allLogs.reduce((sum, l) => sum + l.totalCO2, 0)
    const logCount   = allLogs.length
    const today      = new Date().toISOString().split("T")[0]
    const yesterday  = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    // Streak calculation
    let user = await User.findOne({ userId })
    if (!user) user = new User({ userId })

    let newStreak = user.streak
    if (date === today) {
      if (user.lastLogDate === yesterday) newStreak = user.streak + 1
      else if (user.lastLogDate !== today) newStreak = 1
    }

    await User.findOneAndUpdate(
      { userId },
      { totalCO2: totalCO2_, logCount, streak: newStreak, lastLogDate: date },
      { upsert: true, new: true }
    )

    console.log(`✅ Log saved — user:${userId} date:${date} CO2:${co2}kg`)
    res.json({ success: true, data: log })
  } catch (err) {
    console.error("Log save error:", err.message)
    res.status(500).json({ error: "Failed to save log", details: err.message })
  }
})

// GET /api/logs/:userId — fetch ALL logs for a user (all time)
router.get("/:userId", async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .lean()
    res.json({ userId: req.params.userId, logs, count: logs.length })
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs", details: err.message })
  }
})

// GET /api/logs/:userId/range?start=YYYY-MM-DD&end=YYYY-MM-DD — fetch logs in a date range
router.get("/:userId/range", async (req, res) => {
  try {
    const { start, end } = req.query
    const query = { userId: req.params.userId }
    if (start || end) {
      query.date = {}
      if (start) query.date.$gte = start
      if (end)   query.date.$lte = end
    }
    const logs = await Log.find(query).sort({ date: -1 }).lean()
    res.json({ logs, count: logs.length })
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs", details: err.message })
  }
})

// GET /api/logs/:userId/week — last 7 days of logs
router.get("/:userId/week", async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
    const logs = await Log.find({ userId: req.params.userId, date: { $gte: sevenDaysAgo } })
      .sort({ date: 1 })
      .lean()
    res.json({ logs, count: logs.length })
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weekly logs", details: err.message })
  }
})

// GET /api/logs/:userId/:date — fetch a specific day's log
router.get("/:userId/:date", async (req, res) => {
  try {
    const log = await Log.findOne({ userId: req.params.userId, date: req.params.date }).lean()
    if (!log) return res.status(404).json({ error: "No log found for this date" })
    res.json(log)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch log", details: err.message })
  }
})

module.exports = router
