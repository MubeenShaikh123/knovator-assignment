import mongoose from "mongoose";

const FailedJobSchema = new mongoose.Schema({
  feedUrl: { type: String, required: true },
  jobId: { type: String },
  error: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("FailedJob", FailedJobSchema);
