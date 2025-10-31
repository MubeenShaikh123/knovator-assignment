import Bull from "bull";
import dotenv from "dotenv";
dotenv.config();

export const jobQueue = new Bull("jobQueue", {
  redis: { host: "127.0.0.1", port: 6379 },
});

jobQueue.on("completed", job => console.log(`✅ Job ${job.id} completed`));
jobQueue.on("failed", (job, err) => console.error(`❌ Job ${job.id} failed:`, err));
