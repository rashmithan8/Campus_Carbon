export const CARBON_FACTORS = {
  meals: {
    "Vegetarian": 0.5,
    "Eggs / Dairy": 1.2,
    "Chicken": 2.5,
    "Fish": 1.8,
    "Beef / Mutton": 6.0,
  },
  transport: {
    "Walking": 0,
    "Cycling": 0,
    "College Bus": 0.3,
    "City Bus / Metro": 0.8,
    "Auto-rickshaw": 1.5,
    "Cab (Ola/Uber)": 2.2,
    "Bike (own)": 0.6,
    "Car": 3.5,
  },
  energy: {
    "Very low (no AC)": 0.2,
    "Low (fan only)": 0.4,
    "Medium (AC < 4 hrs)": 0.9,
    "High (AC all day)": 1.6,
  },
}

export const TIPS = [
  "Taking the college bus instead of an Uber saves ~1.9 kg CO₂ per trip — that's like planting a tree!",
  "A vegetarian meal emits 5x less CO₂ than beef. One swap a day adds up to 200 kg saved per year.",
  "Turning off AC when leaving your room for >30 mins saves ~0.5 kg CO₂ daily.",
  "Cycling to campus 3 days a week can cut your transport emissions by 60%.",
  "Sharing a cab with 3 classmates cuts your per-person emission to less than an auto-rickshaw.",
]

export const ACHIEVEMENTS = [
  { icon: "🌱", title: "First Log",     desc: "Logged your first day",    key: "first_log" },
  { icon: "🔥", title: "7-Day Streak",  desc: "7 days in a row",          key: "streak_7" },
  { icon: "🚲", title: "Cycle Warrior", desc: "Cycled 5 days",            key: "cycle_5" },
  { icon: "🥗", title: "Green Plate",   desc: "Veg meals 5 days",         key: "veg_5" },
  { icon: "⚡", title: "Energy Saver",  desc: "Low energy 7 days",        key: "energy_7" },
  { icon: "🏆", title: "Top 3",         desc: "Reach campus top 3",       key: "top_3" },
]

export const MOCK_WEEK = [
  { day: "Mon", co2: 1.8 },
  { day: "Tue", co2: 2.1 },
  { day: "Wed", co2: 1.5 },
  { day: "Thu", co2: 1.9 },
  { day: "Fri", co2: 1.4 },
  { day: "Sat", co2: 2.3 },
  { day: "Today", co2: 1.4 },
]

export const MOCK_LEADERBOARD = [
  { rank: 1, name: "Priya S.",  dept: "CSE",   co2: 0.7, streak: 18, av: "PS" },
  { rank: 2, name: "Rahul K.",  dept: "MECH",  co2: 0.9, streak: 12, av: "RK" },
  { rank: 3, name: "Ananya R.", dept: "ECE",   co2: 1.1, streak: 9,  av: "AR" },
  { rank: 4, name: "You",       dept: "CSE",   co2: 1.4, streak: 7,  av: "YO", isUser: true },
  { rank: 5, name: "Vikram P.", dept: "CIVIL", co2: 1.6, streak: 5,  av: "VP" },
  { rank: 6, name: "Sneha M.",  dept: "IT",    co2: 1.9, streak: 3,  av: "SM" },
  { rank: 7, name: "Karan T.",  dept: "MBA",   co2: 2.2, streak: 2,  av: "KT" },
]

export const calcScore = (log) =>
  (CARBON_FACTORS.meals[log.meal] ?? 0) +
  (CARBON_FACTORS.transport[log.transport] ?? 0) +
  (CARBON_FACTORS.energy[log.energy] ?? 0)

export const scoreColor = (s) => {
  if (s < 1.5) return "#4ade80"
  if (s < 2.5) return "#facc15"
  return "#f87171"
}

export const scoreLabel = (s) => {
  if (s < 1.5) return "Excellent"
  if (s < 2.5) return "Good"
  if (s < 3.5) return "Fair"
  return "High"
}
