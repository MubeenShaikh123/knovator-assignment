"use client";
import React from "react";

export default function ImportTable({ logs }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md mt-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">File Name</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-700">Total</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-700">New</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-700">Updated</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-700">Failed</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-700">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-6 text-gray-500">
                No import logs yet
              </td>
            </tr>
          ) : (
            logs.map((log, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-blue-600 break-words">{log.fileName}</td>
                <td className="px-4 py-3 text-sm">{log.totalFetched}</td>
                <td className="px-4 py-3 text-sm text-green-600">{log.newJobs}</td>
                <td className="px-4 py-3 text-sm text-yellow-600">{log.updatedJobs}</td>
                <td className="px-4 py-3 text-sm text-red-600">{log.failedJobs}</td>
                <td className="px-4 py-3 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
