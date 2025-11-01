# 🧭 Architecture & System Design — Artha Job Board

This document explains the **architecture, data flow, and design decisions** behind the *Artha Job Importer* system.

---

## 🧱 Overview

A scalable background job importer that:
- Periodically fetches jobs from multiple **XML-based APIs**.
- Converts data to JSON and queues it in **Redis (Bull)**.
- Uses a background **worker process** to insert/update jobs in **MongoDB**.
- Logs every import’s summary (total/new/updated/failed).
- Provides an **Admin UI** built in **Next.js** to trigger and view imports.

---

## ⚙️ High-Level Architecture

```
        ┌────────────────────────────┐
        │ Cron Job / Manual Trigger  │
        └─────────────┬──────────────┘
                      │
              fetchAndQueueJobs()
                      │
                      ▼
            ┌────────────────────┐
            │   Redis Queue      │ (Bull)
            └─────────┬──────────┘
                      │
              jobProcessor Worker
                      │
        ┌─────────────┼────────────────┐
        │             │                │
        ▼             ▼                ▼
    New Jobs     Updated Jobs    Failed Jobs
        │             │                │
        ▼             ▼                ▼
    MongoDB:        MongoDB:        MongoDB:
    jobs            importlogs      failedjobs
```


---

## 🧩 Components

### **Backend**
| Module | Purpose |
|---------|----------|
| `index.js` | Entry point, API routes, cron setup |
| `jobService.js` | Fetch XML feeds, convert to JSON, add to queue |
| `jobProcessor.js` | Worker that inserts/updates MongoDB & logs results |
| `ImportLog.js` | Logs per-feed import stats |
| `FailedJob.js` | Stores detailed failure reasons |
| `redis.js` | Initializes Bull + Redis configuration |

### **Frontend**
| File | Description |
|------|--------------|
| `/app/page.jsx` | Trigger manual import |
| `/app/import-history/page.jsx` | Display import logs |
| `/components/ImportTable.jsx` | Reusable log table |
| `/lib/api.jsx` | Axios helper for backend API calls |

---

## 🔄 Data Flow

1. **Trigger:** Cron (every hour) or manual `/import` API call.
2. **Fetch:** Job feeds fetched from 9 XML APIs (Jobicy + HigherEd).
3. **Convert:** XML → JSON using `xml2js`.
4. **Queue:** Each job pushed to Redis via Bull.
5. **Process:** Worker inserts new jobs or updates existing ones.
6. **Log:** Creates `ImportLog` entry per feed, and `FailedJob` if any errors.
7. **Frontend:** Fetches `/logs` endpoint and displays summary.

---

## ⚙️ Environment Configurations

| Variable | Description |
|-----------|--------------|
| `ENABLE_CRON` | Enable/disable automatic imports |
| `CRON_SCHEDULE` | Cron timing expression (default: hourly) |
| `MAX_CONCURRENCY` | Max parallel jobs processed by worker |
| `RETRY_ATTEMPTS` | Retry count for failed jobs |
| `RETRY_BACKOFF` | Retry backoff delay (ms) |

---

## 🧠 Design Decisions

| Concern | Decision | Reason |
|----------|-----------|--------|
| Scalability | Worker separated from API | Allows distributed workers or microservices |
| Reliability | Retry + backoff via Bull | Handles transient DB/network errors |
| Data Integrity | Unique `jobId` constraint | Prevents duplicates across imports |
| Transparency | `ImportLog` + `FailedJob` collections | Full audit of import results |
| Simplicity | JSON REST API + Next.js frontend | Easy to test and extend |

---

## 🗃 MongoDB Collections

| Collection | Description |
|-------------|--------------|
| `jobs` | Stores fetched and updated job listings |
| `importlogs` | Tracks per-import totals and timestamps |
| `failedjobs` | Logs failed jobs with feed URL, jobId, and error message |

---

## 🧩 Cron Scheduling

- Managed via `node-cron`
- Default schedule: every hour (`0 * * * *`)
- Controlled by environment flags (`ENABLE_CRON`, `CRON_TIMEZONE`)

---

## ✅ Summary

✔ Fetches jobs from 9 APIs (XML → JSON)  
✔ Processes asynchronously via Redis queue  
✔ Tracks new, updated, and failed jobs  
✔ Logs failures with reasons  
✔ Provides simple monitoring UI in Next.js  
✔ Fully matches Artha Job Board assignment requirements
