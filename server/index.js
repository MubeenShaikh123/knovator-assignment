import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";

import "./jobs/jobProcessor.js";
import { fetchAndQueueJobs } from "./services/jobService.js";
import ImportLog from "./models/ImportLog.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/artha_jobs";
mongoose.connect(mongoUri, { dbName: "artha_jobs" })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB Error:", err));

// Basic routes
app.get("/", (req, res) => res.send("Artha Job Importer Running ✅"));

app.get("/import", async (req, res) => {
  try {
    await fetchAndQueueJobs();
    res.json({ message: "Jobs fetched & queued!" });
  } catch (err) {
    console.error("Error triggering import:", err);
    res.status(500).json({ message: "Import failed", error: err.message });
  }
});

app.get("/logs", async (req, res) => {
  try {
    const logs = await ImportLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs", error: err.message });
  }
});

// Cron configuration
const enableCron = (process.env.ENABLE_CRON ?? "true").toLowerCase() !== "false";
const cronSchedule = process.env.CRON_SCHEDULE || "0 * * * *"; // default every hour

if (enableCron) {
  try {
    // Validate cron expression at schedule time; node-cron will throw if invalid
    cron.schedule(cronSchedule, async () => {
      console.log(`⏰ Cron triggered at ${new Date().toISOString()} - fetching job feeds...`);
      try {
        await fetchAndQueueJobs();
        console.log("✅ Cron: fetchAndQueueJobs executed successfully");
      } catch (err) {
        console.error("❌ Cron: fetchAndQueueJobs error:", err);
      }
    }, {
      scheduled: true,
      timezone: process.env.CRON_TIMEZONE || undefined, // optional: set timezone in .env
    });

    console.log(`⏱ Cron scheduled: "${cronSchedule}" (ENABLE_CRON=${enableCron})`);
  } catch (err) {
    console.error("❌ Failed to schedule cron job:", err);
  }
} else {
  console.log("⏸ Cron disabled (ENABLE_CRON=false)");
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
