# 🌱 CampusCarbon

> AI-powered carbon footprint tracker built for college students.
> Track daily habits, get AI-driven nudges, and compete with your campus on sustainability.

---

## 📁 Directory Structure

```
campuscarbon/
├── README.md
│
├── frontend/                      # React + Vite web app
│   ├── index.html                 # App HTML shell
│   ├── vite.config.js             # Vite config with proxy to backend
│   ├── package.json
│   └── src/
│       ├── main.jsx               # React entry point
│       ├── App.jsx                # Root component + state management
│       ├── constants/
│       │   └── data.js            # Carbon factors, mock data, helpers
│       └── components/
│           ├── UI.jsx             # Shared: NavBar, Ring, Card, Stat
│           ├── Dashboard.jsx      # Home screen — score ring, chart, tips
│           ├── LogPage.jsx        # Daily habit logging form
│           ├── LeaderboardPage.jsx# Campus ranking board
│           └── CoachPage.jsx      # AI coach chat interface
│
└── backend/                       # Node.js + Express API
    ├── server.js                  # Main server, middleware, routes
    ├── package.json
    ├── .env.example               # Template for environment variables
    └── routes/
        ├── logs.js                # POST /api/logs, GET /api/logs/:userId
        ├── leaderboard.js         # GET /api/leaderboard
        └── coach.js               # POST /api/coach (Claude AI)
```

---

## ⚙️ Prerequisites

Make sure you have these installed before starting:

| Tool       | Version  | Install link                        |
|------------|----------|-------------------------------------|
| Node.js    | ≥ 18.x   | https://nodejs.org/                 |
| npm        | ≥ 9.x    | Comes with Node.js                  |

---

## 🚀 Setup & Run — Step by Step

### Step 1 — Clone or unzip the project

```bash
cd campuscarbon
```

---

### Step 2 — Set up the Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create your .env file from the template
cp .env.example .env
```

Now open `.env` and add your Anthropic API key:

```
GROQ_API_KEY=gsk_YOUR_ACTUAL_KEY_HERE
PORT=5000
FRONTEND_URL=http://localhost:3000
```

> 🔑 Get your API key at https://console.groq.com → API Keys → Create Key

Start the backend:

```bash
# For development (auto-restarts on file changes)
npm run dev

# OR for production
npm start
```

You should see:
```
╔══════════════════════════════════════╗
║        🌱 CampusCarbon API           ║
║  Server running on port 5000         ║
╚══════════════════════════════════════╝
```

Verify it works by opening: http://localhost:5000/api/health

---

### Step 3 — Set up the Frontend

Open a **new terminal** (keep the backend running):

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

You should see:
```
VITE ready in Xms
➜  Local:   http://localhost:3000/
```

Open **http://localhost:3000** in your browser. 🎉

---

## 🌐 API Endpoints

| Method | Endpoint                     | Description                          |
|--------|------------------------------|--------------------------------------|
| GET    | /api/health                  | Server health check                  |
| POST   | /api/logs                    | Save a daily carbon log              |
| GET    | /api/logs/:userId            | Get all logs for a user              |
| GET    | /api/logs/:userId/:date      | Get a specific day's log             |
| GET    | /api/leaderboard             | Get campus leaderboard               |
| POST   | /api/leaderboard/register    | Register/update a user's stats       |
| POST   | /api/coach                   | Send a message to the AI coach       |

### Example — Save a log

```bash
curl -X POST http://localhost:5000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "student_01",
    "date": "2026-05-14",
    "meal": "Vegetarian",
    "transport": "College Bus",
    "energy": "Low (fan only)",
    "totalCO2": 1.1
  }'
```

### Example — Chat with AI coach

```bash
curl -X POST http://localhost:5000/api/coach \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "How can I reduce my transport emissions?"}],
    "context": { "todayScore": 1.4, "weekAvg": "1.8" }
  }'
```

---

## 🧪 Running Without a Backend

The app works **fully offline** too — all mock data is built into the frontend.
The AI Coach tab will show an error message if the backend isn't running, but all other features (logging, dashboard, leaderboard) work independently.

---

## 🏗️ Tech Stack

| Layer      | Technology               |
|------------|--------------------------|
| Frontend   | React 18, Vite, Recharts |
| Backend    | Node.js, Express         |
| AI         | Claude (Groq SDK (Free))   |
| Styling    | Inline CSS, Outfit font  |
| State      | React useState (no Redux)|
| HTTP       | Axios                    |

---

## 🌿 Features

- **Carbon Score Ring** — visual daily CO₂ gauge
- **Daily Logger** — 3-tap logging for meal, transport, energy
- **Live CO₂ Preview** — see your score update as you pick options
- **Weekly Trend Chart** — area chart of 7-day emissions
- **AI Coach** — Claude-powered chat with campus-specific advice
- **Campus Leaderboard** — rank among peers by kg CO₂/day
- **Achievements** — gamified badges for green habits
- **Daily Tips** — rotating sustainability nudges
- **Streak Tracker** — daily habit reinforcement

---

## 📊 Carbon Emission Factors Used

| Category      | Option             | kg CO₂ |
|---------------|--------------------|--------|
| **Meals**     | Vegetarian         | 0.5    |
|               | Eggs / Dairy       | 1.2    |
|               | Chicken            | 2.5    |
|               | Fish               | 1.8    |
|               | Beef / Mutton      | 6.0    |
| **Transport** | Walking / Cycling  | 0.0    |
|               | College Bus        | 0.3    |
|               | City Bus / Metro   | 0.8    |
|               | Auto-rickshaw      | 1.5    |
|               | Bike (own)         | 0.6    |
|               | Cab (Ola/Uber)     | 2.2    |
|               | Car                | 3.5    |
| **Energy**    | No AC              | 0.2    |
|               | Fan only           | 0.4    |
|               | AC < 4 hrs         | 0.9    |
|               | AC all day         | 1.6    |

Sources: IPCC AR6, EPA GHG factors, IEA India Grid Intensity 2024.

---

## 🔧 Common Issues

**"Cannot connect to backend"**
→ Make sure `npm run dev` is running in the `/backend` folder on port 5000.

**"AI coach not responding"**
→ Check your `GROQ_API_KEY` in `/backend/.env`. Make sure it starts with `sk-ant-`.

**"Port 3000 already in use"**
→ Kill the process: `lsof -ti:3000 | xargs kill` then retry.

**"Module not found" errors**
→ Run `npm install` again in both `/frontend` and `/backend`.

---

## 📈 Future Roadmap (Post-Hackathon)

- [ ] Firebase/Supabase for persistent data storage
- [ ] Google OAuth login for students
- [ ] College admin dashboard with ESG reports
- [ ] Push notifications for streak reminders
- [ ] PWA (installable on mobile)
- [ ] Peer challenges and group competitions
- [ ] Integration with college canteen menus

---

## 🌍 UN SDGs Addressed

- **SDG 13** — Climate Action (primary)
- **SDG 4** — Quality Education
- **SDG 11** — Sustainable Cities & Communities

---

Built with ❤️ for the hackathon. Let's make campuses greener, one log at a time. 🌱


---

## 🍃 MongoDB Atlas Setup (Free Database)

### Step 1 — Create a free MongoDB Atlas account
1. Go to **https://cloud.mongodb.com**
2. Click **"Try Free"** → sign up (no credit card needed)

### Step 2 — Create a free cluster
1. Click **"Build a Database"**
2. Choose **"M0 Free"** tier (512 MB, always free)
3. Select any cloud provider & region (pick one closest to you — e.g. Mumbai)
4. Click **"Create"**

### Step 3 — Create a database user
1. Under **Security → Database Access** → click **"Add New Database User"**
2. Set a username (e.g. `campuscarbon`) and a strong password
3. Role: **"Read and Write to any database"**
4. Click **"Add User"**

### Step 4 — Allow your IP address
1. Under **Security → Network Access** → click **"Add IP Address"**
2. Click **"Allow Access from Anywhere"** (easiest for hackathon)
3. Click **"Confirm"**

### Step 5 — Get your connection string
1. Go to **Database → Connect → Drivers**
2. Copy the connection string — looks like:
   ```
   mongodb+srv://campuscarbon:<password>@cluster0.xxxxx.mongodb.net/
   ```
3. Replace `<password>` with your actual password
4. Add `campuscarbon` at the end as the DB name:
   ```
   mongodb+srv://campuscarbon:mypassword@cluster0.xxxxx.mongodb.net/campuscarbon
   ```

### Step 6 — Add to your .env file
```
MONGODB_URI=mongodb+srv://campuscarbon:mypassword@cluster0.xxxxx.mongodb.net/campuscarbon
```

### Step 7 — Restart your backend
```bash
npm run dev
```
You should see: `✅ MongoDB connected successfully`

---

## 🗄️ Database Schema

### `logs` collection
| Field      | Type   | Example            |
|------------|--------|--------------------|
| userId     | String | "demo_user"        |
| date       | String | "2026-05-14"       |
| meal       | String | "Vegetarian"       |
| transport  | String | "College Bus"      |
| energy     | String | "Low (fan only)"   |
| totalCO2   | Number | 1.1                |
| loggedAt   | Date   | 2026-05-14T...     |

### `users` collection
| Field       | Type   | Example        |
|-------------|--------|----------------|
| userId      | String | "demo_user"    |
| name        | String | "Rahul K."     |
| dept        | String | "CSE"          |
| streak      | Number | 7              |
| totalCO2    | Number | 9.8            |
| logCount    | Number | 7              |
| lastLogDate | String | "2026-05-14"   |

**Unique constraint:** One log per `userId + date` — re-logging the same day updates instead of duplicating.
