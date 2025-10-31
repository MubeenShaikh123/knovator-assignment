import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { Queue } from "bull";
import { jobQueue } from "./utils/redis.js";
import { fetchAndQueueJobs } from "./services/jobService.js";
import ImportLog from "./models/ImportLog.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { dbName: "artha_jobs" })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB Error:", err));

app.get("/", (req, res) => res.send("Artha Job Importer Running ✅"));

app.get("/import", async (req, res) => {
  await fetchAndQueueJobs();
  res.json({ message: "Jobs fetched & queued!" });
});

app.get("/logs", async (req, res) => {
  const logs = await ImportLog.find().sort({ createdAt: -1 });
  res.json(logs);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
