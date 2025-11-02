import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://artha-job-board-backend.onrender.com";

export async function fetchImportLogs() {
  const res = await axios.get(`${API_BASE}/logs`);
  return res.data;
}

export async function triggerImport() {
  const res = await axios.get(`${API_BASE}/import`);
  return res.data;
}
