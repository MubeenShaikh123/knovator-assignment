import axios from "axios";

const API_BASE = "http://localhost:5000"; // backend URL

export async function fetchImportLogs() {
  const res = await axios.get(`${API_BASE}/logs`);
  return res.data;
}

export async function triggerImport() {
  const res = await axios.get(`${API_BASE}/import`);
  return res.data;
}
