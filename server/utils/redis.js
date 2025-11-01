import Bull from "bull";
import dotenv from "dotenv";
dotenv.config();

export const jobQueue = new Bull("jobQueue", {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_PASSWORD ? {} : undefined, // enables SSL for Redis Cloud
  },
  settings: {
    backoffStrategies: {
      custom: (attemptsMade) => Math.min(Math.pow(2, attemptsMade) * 1000, 60000),
    },
  },
});

jobQueue.on("completed", (job) => console.log(`✅ Job ${job.id} completed`));
jobQueue.on("failed", (job, err) =>
  console.error(`❌ Job ${job.id} failed after ${job.attemptsMade} attempts: ${err.message}`)
);
