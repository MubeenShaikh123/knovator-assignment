import axios from "axios";
import xml2js from "xml2js";
import { jobQueue } from "../utils/redis.js";
import ImportLog from "../models/ImportLog.js";

export const fetchAndQueueJobs = async () => {
  const urls = [
    "https://jobicy.com/?feed=job_feed",
    "https://jobicy.com/?feed=job_feed&job_categories=data-science",
  ];

  for (const url of urls) {
    try {
      const { data } = await axios.get(url);
      const result = await xml2js.parseStringPromise(data, { explicitArray: false });
      const jobs = result.rss.channel.item || [];
      let total = 0, failed = 0;

      for (const job of jobs) {
        const payload = {
          jobId: job.guid || job.link,
          title: job.title,
          company: job["job:company"] || "Unknown",
          category: job["job:category"] || "N/A",
          description: job.description,
          url: job.link,
        };
        try {
          await jobQueue.add(payload);
          total++;
        } catch {
          failed++;
        }
      }

      await ImportLog.create({
        fileName: url,
        totalFetched: jobs.length,
        newJobs: total,
        updatedJobs: 0,
        failedJobs: failed,
      });

      console.log(`✅ Imported ${total} jobs from ${url}`);
    } catch (err) {
      console.error(`❌ Error fetching from ${url}`, err.message);
    }
  }
};
