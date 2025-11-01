import axios from "axios";
import xml2js from "xml2js";
import { jobQueue } from "../utils/redis.js";
import ImportLog from "../models/ImportLog.js";

export const fetchAndQueueJobs = async () => {
  const urls = [
    "https://jobicy.com/?feed=job_feed",
    "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
    "https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france",
    "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
    "https://jobicy.com/?feed=job_feed&job_categories=data-science",
    "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
    "https://jobicy.com/?feed=job_feed&job_categories=business",
    "https://jobicy.com/?feed=job_feed&job_categories=management",
    "https://www.higheredjobs.com/rss/articleFeed.cfm"
  ];

  const parser = new xml2js.Parser({ explicitArray: false });

  for (const url of urls) {
    try {
      console.log(`🌐 Fetching feed: ${url}`);
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "application/xml, text/xml, */*; q=0.01",
        },
        timeout: 20000,
      });

      const result = await parser.parseStringPromise(data);
      const jobs = result?.rss?.channel?.item || [];

      if (!Array.isArray(jobs)) continue;

      let queued = 0, failed = 0;
      for (const job of jobs) {
        const payload = {
          jobId: job.guid || job.link,
          title: job.title,
          company: job["job:company"] || "Unknown",
          category: job["job:category"] || "N/A",
          description: job.description || "",
          url: job.link,
          feedUrl: url,
        };

        try {
          await jobQueue.add("importJob", payload);
          queued++;
        } catch (err) {
          console.error(`❌ Queue add failed for ${url}:`, err.message);
          failed++;
        }
      }

      await ImportLog.create({
        fileName: url,
        totalFetched: jobs.length,
        newJobs: queued,
        updatedJobs: 0,
        failedJobs: failed,
      });

      console.log(`✅ Imported ${queued} jobs from ${url}`);
    } catch (err) {
      console.error(`❌ Error fetching from ${url}`);
      if (err.response) {
        console.error("Status:", err.response.status);
      } else if (err.request) {
        console.error("Network issue:", err.message);
      } else {
        console.error("Error:", err.message);
      }
    }
  }
};
