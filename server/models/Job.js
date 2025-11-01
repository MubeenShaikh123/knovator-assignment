import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  jobId: { type: String, unique: true, required: true },
  title: String,
  company: String,
  category: String,
  description: String,
  url: String,
}, { timestamps: true });

export default mongoose.model("Job", JobSchema);
