import React, { useState, useEffect } from 'react';

interface AuditLog {
  event_type: string;
  actor: string;
  action: string;
  target: string;
  success: boolean;
  details: string;
  timestamp: number;
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    fetch('/api/security/audit')
      .then(r => r.json())
      .then(data => setLogs(data.logs || []));
  }, []);

  const filtered = logs.filter(log => {
    if (filter === 'success') return log.success;
    if (filter === 'failed') return !log.success;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">🔐 Audit Logs</h1>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'success', 'failed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {f === 'all' ? 'All Events' : f === 'success' ? 'Success' : 'Failed'}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left">Timestamp</th>
              <th className="px-4 py-2 text-left">Event</th>
              <th className="px-4 py-2 text-left">Actor</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Target</th>
              <th className="px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs">
                  {new Date(log.timestamp * 1000).toLocaleString()}
                </td>
                <td className="px-4 py-2">{log.event_type}</td>
                <td className="px-4 py-2">{log.actor}</td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">{log.target}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    log.success
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {log.success ? '✓ Success' : '✗ Failed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
