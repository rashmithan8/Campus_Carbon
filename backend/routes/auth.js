const express  = require("express")
const bcrypt   = require("bcryptjs")
const router   = express.Router()
const User     = require("../models/User")

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { userId, password, name, dept, college } = req.body

    if (!userId || !password || !name) {
      return res.status(400).json({ error: "Username, password and name are required." })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." })
    }

    // Check if username already taken
    const existing = await User.findOne({ userId: userId.toLowerCase() })
    if (existing) {
      return res.status(409).json({ error: "Username already taken. Please choose another." })
    }

    // Hash password — never store plain text
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      userId:   userId.toLowerCase(),
      password: hashedPassword,
      name:     name.trim(),
      dept:     dept?.trim() || "General",
      college:  college?.trim() || "My College",
      streak:   0,
      logCount: 0,
      totalCO2: 0,
    })

    console.log(`✅ New user registered: ${userId}`)
    res.status(201).json({
      success: true,
      user: { userId: user.userId, name: user.name, dept: user.dept, college: user.college, streak: user.streak },
    })
  } catch (err) {
    console.error("Register error:", err.message)
    res.status(500).json({ error: "Registration failed.", details: err.message })
  }
})

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body

    if (!userId || !password) {
      return res.status(400).json({ error: "Username and password are required." })
    }

    const user = await User.findOne({ userId: userId.toLowerCase() })
    if (!user) {
      return res.status(404).json({ error: "Username not found. Please register first." })
    }

    // Compare password with stored hash
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ error: "Incorrect password. Please try again." })
    }

    console.log(`✅ User logged in: ${userId}`)
    res.json({
      success: true,
      user: { userId: user.userId, name: user.name, dept: user.dept, college: user.college, streak: user.streak },
    })
  } catch (err) {
    console.error("Login error:", err.message)
    res.status(500).json({ error: "Login failed.", details: err.message })
  }
})

module.exports = router
