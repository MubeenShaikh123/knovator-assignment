"use client";
import { useEffect, useState } from "react";
import { fetchImportLogs } from "@/lib/api";
import ImportTable from "@/components/ImportTable";

export default function ImportHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchImportLogs();
        setLogs(data);
      } catch (err) {
        console.error("Failed to load logs", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">📜 Import History</h1>
      <p className="text-gray-600 mb-6">View your recent job imports and status.</p>
      {loading ? (
        <p className="text-gray-500">Loading logs...</p>
      ) : (
        <ImportTable logs={logs} />
      )}
    </div>
  );
}
