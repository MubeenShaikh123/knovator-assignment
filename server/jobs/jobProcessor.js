import { jobQueue } from "../utils/redis.js";
import Job from "../models/Job.js";

jobQueue.process(5, async (job) => {
  const data = job.data;
  const existing = await Job.findOne({ jobId: data.jobId });
  if (existing) {
    await Job.updateOne({ jobId: data.jobId }, data);
  } else {
    await Job.create(data);
  }
  return true;
});
