const express = require("express")
const Groq    = require("groq-sdk")
const router  = express.Router()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// POST /api/coach — send a message to the AI coach (powered by Groq — free & fast!)
router.post("/", async (req, res) => {
  const { messages, context } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" })
  }

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.startsWith("gsk_xxx")) {
    return res.status(500).json({ error: "GROQ_API_KEY not configured in .env file. Get a free key at https://console.groq.com" })
  }

  const { todayScore, todayLog, weekAvg } = context || {}

  const systemPrompt = `You are CampusCarbon AI Coach, a friendly sustainability assistant for college students in India.

Current user stats:
- Today CO2: ${todayScore ?? "not logged"} kg
- Meal: ${todayLog?.meal || "not logged"}
- Transport: ${todayLog?.transport || "not logged"}
- Energy: ${todayLog?.energy || "not logged"}
- Weekly avg: ${weekAvg ?? "N/A"} kg/day, Campus rank: #4 of 847

Be warm, specific, reference Indian campus life (hostels, mess food, autos, college buses).
Keep replies to 2-4 sentences. End with one actionable step for TODAY. Use one emoji.`

  try {
    const apiMessages = messages
      .filter((m, i) => !(i === 0 && m.role === "assistant"))
      .map(m => ({ role: m.role, content: m.content }))

    const completion = await groq.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      max_tokens:  300,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...apiMessages,
      ],
    })

    const reply = completion.choices?.[0]?.message?.content ?? "Sorry, couldn't generate a response."
    console.log(`🤖 Groq replied to: "${apiMessages.at(-1)?.content?.slice(0, 50)}..."`)
    res.json({ reply })
  } catch (err) {
    console.error("Groq API error:", err.message)
    res.status(500).json({ error: "AI request failed", details: err.message })
  }
})

module.exports = router
