import React, { useState, useEffect } from 'react';

interface Process {
  pid: number;
  name: string;
  status: string;
  cpu_percent: number;
  memory_bytes: number;
  io_read: number;
  io_write: number;
  created_at: number;
}

export function ProcessList() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'name'>('memory');

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/monitor/processes')
        .then(r => r.json())
        .then(data => {
          setProcesses(data.processes || []);
          setLoading(false);
        });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sorted = [...processes].sort((a, b) => {
    switch (sortBy) {
      case 'cpu':
        return b.cpu_percent - a.cpu_percent;
      case 'memory':
        return b.memory_bytes - a.memory_bytes;
      case 'name':
        return a.name.localeCompare(b.name);
    }
  });

  const handleKill = async (pid: number) => {
    try {
      await fetch('/api/monitor/kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid }),
      });
      setProcesses(processes.filter(p => p.pid !== pid));
    } catch (error) {
      console.error('Failed to kill process:', error);
    }
  };

  if (loading && processes.length === 0) {
    return <div className="p-6">Loading processes...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">📊 Task Manager</h1>

      {/* Sort Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy('cpu')}
          className={`px-4 py-2 rounded ${sortBy === 'cpu' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Sort by CPU
        </button>
        <button
          onClick={() => setSortBy('memory')}
          className={`px-4 py-2 rounded ${sortBy === 'memory' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Sort by Memory
        </button>
        <button
          onClick={() => setSortBy('name')}
          className={`px-4 py-2 rounded ${sortBy === 'name' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Sort by Name
        </button>
      </div>

      {/* Process Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left">Process Name</th>
              <th className="px-4 py-2 text-right">PID</th>
              <th className="px-4 py-2 text-right">CPU %</th>
              <th className="px-4 py-2 text-right">Memory</th>
              <th className="px-4 py-2 text-right">Status</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(proc => (
              <tr key={proc.pid} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-sm">{proc.name}</td>
                <td className="px-4 py-2 text-right text-gray-600">{proc.pid}</td>
                <td className="px-4 py-2 text-right">
                  <span className={proc.cpu_percent > 50 ? 'text-red-600' : 'text-green-600'}>
                    {proc.cpu_percent.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  {(proc.memory_bytes / 1024 / 1024).toFixed(1)} MB
                </td>
                <td className="px-4 py-2 text-right">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {proc.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleKill(proc.pid)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Kill
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-blue-50 border rounded p-4">
          <p className="text-sm text-gray-600">Total Processes</p>
          <p className="text-2xl font-bold text-blue-600">{processes.length}</p>
        </div>
        <div className="bg-orange-50 border rounded p-4">
          <p className="text-sm text-gray-600">Highest CPU</p>
          <p className="text-2xl font-bold text-orange-600">
            {Math.max(...processes.map(p => p.cpu_percent), 0).toFixed(1)}%
          </p>
        </div>
        <div className="bg-green-50 border rounded p-4">
          <p className="text-sm text-gray-600">Total Memory Used</p>
          <p className="text-2xl font-bold text-green-600">
            {(processes.reduce((sum, p) => sum + p.memory_bytes, 0) / 1024 / 1024 / 1024).toFixed(2)} GB
          </p>
        </div>
      </div>
    </div>
  );
}
