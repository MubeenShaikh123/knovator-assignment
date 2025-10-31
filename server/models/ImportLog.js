import mongoose from "mongoose";

const ImportLogSchema = new mongoose.Schema({
  fileName: String,
  totalFetched: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedJobs: Number,
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("ImportLog", ImportLogSchema);
