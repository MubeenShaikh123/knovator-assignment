import Bull from "bull";
import dotenv from "dotenv";
dotenv.config();

export const jobQueue = new Bull("jobQueue", {
  redis: { host: "127.0.0.1", port: 6379 },
  settings: {
    backoffStrategies: {
      custom: function (attemptsMade) {
        // Exponential backoff
        const backoff = Math.pow(2, attemptsMade) * 1000;
        return Math.min(backoff, 60000); // cap at 60s
      }
    }
  }
});

jobQueue.on("completed", job => console.log(`✅ Job ${job.id} completed`));
jobQueue.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed after ${job.attemptsMade} attempts: ${err.message}`);
});
