import { jobQueue } from "../utils/redis.js";
import Job from "../models/Job.js";
import ImportLog from "../models/ImportLog.js";
import FailedJob from "../models/FailedJob.js";

const concurrency = parseInt(process.env.MAX_CONCURRENCY || "5");

jobQueue.process("importJob", concurrency, async (job) => {
  const { feedUrl, ...data } = job.data;

  try {
    const existing = await Job.findOne({ jobId: data.jobId });

    if (existing) {
      await Job.updateOne({ jobId: data.jobId }, data);
      return { feedUrl, status: "updated" };
    } else {
      await Job.create(data);
      return { feedUrl, status: "new" };
    }
  } catch (err) {
    // Save failure reason
    await FailedJob.create({
      feedUrl,
      jobId: data.jobId,
      error: err.message || "Unknown error",
    });

    return { feedUrl, status: "failed", reason: err.message };
  }
});

// ✅ Aggregate job results and create ImportLog entries
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

    // After every 50 jobs or at the end of queue, save summary
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
    console.error("⚠️ Error processing job result:", err.message);
  }
});
