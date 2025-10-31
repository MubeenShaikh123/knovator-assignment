"use client";
import { useState } from "react";
import { triggerImport } from "@/lib/api";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImport = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await triggerImport();
      setMessage(res.message);
    } catch (err) {
      setMessage("Error triggering import");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Artha Job Importer</h1>
        <p className="text-gray-600 mb-6">
          Manage and track your background job imports efficiently.
        </p>
        <button
          onClick={handleImport}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Importing..." : "🚀 Trigger Job Import"}
        </button>

        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}

        <Link href="/import-history" className="block mt-8 text-blue-600 hover:underline">
          📜 View Import History →
        </Link>
      </div>
    </div>
  );
}
