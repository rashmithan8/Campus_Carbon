const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,   // hashed with bcrypt — never stored as plain text
  },
  name: {
    type: String,
    default: "Student",
  },
  dept: {
    type: String,
    default: "General",
  },
  college: {
    type: String,
    default: "My College",
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastLogDate: {
    type: String,   // "YYYY-MM-DD"
    default: null,
  },
  totalCO2: {
    type: Number,
    default: 0,
  },
  logCount: {
    type: Number,
    default: 0,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
})

// Virtual: average CO2 per day
userSchema.virtual("avgCO2").get(function () {
  if (!this.logCount) return 0
  return parseFloat((this.totalCO2 / this.logCount).toFixed(2))
})

module.exports = mongoose.model("User", userSchema)
