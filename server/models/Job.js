import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  jobId: String,
  title: String,
  company: String,
  category: String,
  description: String,
  url: String,
}, { timestamps: true });

export default mongoose.model("Job", JobSchema);
