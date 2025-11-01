# 🧩 Artha Job Board - Scalable Job Importer

A scalable **Job Import System** built with the **MERN stack (MongoDB, Express, React/Next.js, Node.js)** and **Redis (Bull Queue)** for background job processing.

This system automatically fetches jobs from multiple public job APIs (XML feeds), processes them asynchronously via Redis, inserts/updates them in MongoDB, and tracks import history with full logging.

---

## 🚀 Features

✅ Fetches jobs from **multiple XML APIs** and converts them to JSON  
✅ Uses **Redis + Bull** for background queue processing  
✅ Detects **new / updated jobs** and logs counts  
✅ Automatically runs every hour via **Cron Job**  
✅ Stores **failed jobs with error reasons**  
✅ Provides an **Admin UI (Next.js)** for manual trigger and import history  
✅ Configurable concurrency, retry logic, and backoff via `.env`

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | Next.js (React, TailwindCSS) |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose ORM) |
| Queue | Bull + Redis |
| Scheduler | node-cron |
| Parser | xml2js |
| Deployment Ready | Render (API) + Vercel (Frontend) + MongoDB Atlas + Redis Cloud |

---

## 📂 Project Structure

```
artha-job-board/
├── client/ # Frontend (Next.js App Router)
│ ├── app/ # Pages (Home, Import History)
│ ├── components/ # Reusable UI Components
│ ├── lib/ # API integration (axios)
│ └── package.json
│
├── server/ # Backend (Express API)
│ ├── jobs/ # Bull worker processors
│ ├── models/ # MongoDB Schemas
│ ├── services/ # Fetch and Queue logic
│ ├── utils/ # Redis Queue instance
│ ├── index.js # Server entry point
│ └── .env # Config vars (ignored in Git)
│
├── docs/
│ └── architecture.md # Design explanation & diagram
│
├── README.md # Setup & usage
└── package.json
```

---

## ⚙️ Environment Variables

`.env` (inside `/server`):

```
MONGO_URI=mongodb://localhost:27017/artha_jobs
PORT=5000

Cron Job

ENABLE_CRON=true
CRON_SCHEDULE=0 * * * * # every hour
CRON_TIMEZONE=Asia/Kolkata

Worker settings

MAX_CONCURRENCY=5
RETRY_ATTEMPTS=3
RETRY_BACKOFF=5000
```

---

## 🧩 Setup & Run

### 1️⃣ Backend Setup
```bash
cd server
npm install
npm start
```

✅ Runs at http://localhost:5000

### 2️⃣ Frontend Setup
```
cd client
npm install
npm run dev
```
✅ Opens at http://localhost:3000