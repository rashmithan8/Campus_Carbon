const mongoose = require("mongoose")

const logSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  date: {
    type: String,   // "YYYY-MM-DD" format
    required: true,
  },
  meal: {
    type: String,
    required: true,
    enum: ["Vegetarian", "Eggs / Dairy", "Chicken", "Fish", "Beef / Mutton"],
  },
  transport: {
    type: String,
    required: true,
    enum: ["Walking", "Cycling", "College Bus", "City Bus / Metro", "Auto-rickshaw", "Cab (Ola/Uber)", "Bike (own)", "Car"],
  },
  energy: {
    type: String,
    required: true,
    enum: ["Very low (no AC)", "Low (fan only)", "Medium (AC < 4 hrs)", "High (AC all day)"],
  },
  totalCO2: {
    type: Number,
    required: true,
    min: 0,
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
})

// One log per user per day — upsert will update if re-logged
logSchema.index({ userId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model("Log", logSchema)
