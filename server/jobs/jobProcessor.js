import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/artha_jobs";
if (!mongoose.connection.readyState) {
  mongoose.connect(mongoUri, { dbName: "artha_jobs" })
    .then(() => console.log("✅ Worker connected to MongoDB"))
    .catch(err => console.error("❌ Worker MongoDB connection error:", err));
}

import { jobQueue } from "../utils/redis.js";
import Job from "../models/Job.js";
import ImportLog from "../models/ImportLog.js";
import FailedJob from "../models/FailedJob.js";

const concurrency = parseInt(process.env.MAX_CONCURRENCY || "5");

jobQueue.process("importJob", concurrency, async (job) => {
  const { feedUrl, ...data } = job.data;

  try {
    if (!data.jobId) throw new Error("Missing jobId");

    const existing = await Job.findOne({ jobId: data.jobId });
    if (existing) {
      await Job.updateOne({ jobId: data.jobId }, data);
      return { feedUrl, status: "updated" };
    } else {
      await Job.create(data);
      return { feedUrl, status: "new" };
    }
  } catch (err) {
    // Record the error in FailedJob
    await FailedJob.create({
      feedUrl,
      jobId: data.jobId || "unknown",
      error: err.message || "Unknown error",
    });
    console.error(`❌ Failed to process job (${data.jobId}):`, err.message);
    return { feedUrl, status: "failed" };
  }
});

// Log batch summary
jobQueue.on("global:completed", async (jobId, resultStr) => {
  try {
    const result = JSON.parse(resultStr);
    const { feedUrl, status } = result;

    if (!global.importStats) global.importStats = {};
    const stats = (global.importStats[feedUrl] ||= {
      totalFetched: 0,
      newJobs: 0,
      updatedJobs: 0,
      failedJobs: 0,
    });

    stats.totalFetched++;
    if (status === "new") stats.newJobs++;
    else if (status === "updated") stats.updatedJobs++;
    else if (status === "failed") stats.failedJobs++;

    if (stats.totalFetched % 50 === 0) {
      await ImportLog.create({
        fileName: feedUrl,
        totalFetched: stats.totalFetched,
        newJobs: stats.newJobs,
        updatedJobs: stats.updatedJobs,
        failedJobs: stats.failedJobs,
        timestamp: new Date(),
      });
      console.log(`📊 ImportLog updated for ${feedUrl}:`, stats);
      delete global.importStats[feedUrl];
    }
  } catch (err) {
    console.error("⚠️ Error summarizing jobs:", err.message);
  }
});
