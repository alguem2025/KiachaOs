import React, { useState, useEffect } from 'react';

interface SystemInfo {
  cpuCores: number;
  cpuFrequency: number;
  memoryTotal: number;
  memoryFree: number;
  kernelVersion: string;
  osVersion: string;
}

export function SystemSettings() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/system')
      .then(r => r.json())
      .then(setSystemInfo)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading system info...</div>;
  if (!systemInfo) return <div className="p-6 text-red-500">Failed to load system info</div>;

  const memoryPercentage = ((systemInfo.memoryTotal - systemInfo.memoryFree) / systemInfo.memoryTotal * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">🖥️ System Information</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900">CPU</h3>
          <p className="text-2xl font-bold text-blue-700 mt-2">{systemInfo.cpuCores}</p>
          <p className="text-sm text-blue-600">Cores / Threads</p>
          <p className="text-sm text-blue-600 mt-2">Frequency: {(systemInfo.cpuFrequency / 1000).toFixed(2)} GHz</p>
        </div>

        {/* Memory */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900">Memory</h3>
          <p className="text-2xl font-bold text-green-700 mt-2">{(systemInfo.memoryFree / 1024 / 1024 / 1024).toFixed(1)} GB</p>
          <p className="text-sm text-green-600">Available / {(systemInfo.memoryTotal / 1024 / 1024 / 1024).toFixed(1)} GB Total</p>
          <div className="w-full bg-green-200 rounded-full h-2 mt-3">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${memoryPercentage}%` }}
            />
          </div>
          <p className="text-xs text-green-600 mt-1">{memoryPercentage}% Used</p>
        </div>

        {/* Kernel Version */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-900">Kiacha Kernel</h3>
          <p className="text-2xl font-bold text-purple-700 mt-2">v{systemInfo.kernelVersion}</p>
          <p className="text-sm text-purple-600 mt-2">Rust-based microkernel</p>
        </div>

        {/* OS Version */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-orange-900">Operating System</h3>
          <p className="text-2xl font-bold text-orange-700 mt-2">Kiacha OS</p>
          <p className="text-sm text-orange-600 mt-2">Platform: {systemInfo.osVersion}</p>
        </div>
      </div>

      {/* Details Table */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Hardware Details</h3>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-t">
              <td className="py-2 font-semibold">Processor Cores</td>
              <td className="py-2 text-right">{systemInfo.cpuCores}</td>
            </tr>
            <tr className="border-t">
              <td className="py-2 font-semibold">CPU Frequency</td>
              <td className="py-2 text-right">{(systemInfo.cpuFrequency / 1000).toFixed(2)} GHz</td>
            </tr>
            <tr className="border-t">
              <td className="py-2 font-semibold">Total Memory</td>
              <td className="py-2 text-right">{(systemInfo.memoryTotal / 1024 / 1024 / 1024).toFixed(2)} GB</td>
            </tr>
            <tr className="border-t">
              <td className="py-2 font-semibold">Available Memory</td>
              <td className="py-2 text-right text-green-600">{(systemInfo.memoryFree / 1024 / 1024 / 1024).toFixed(2)} GB</td>
            </tr>
            <tr className="border-t">
              <td className="py-2 font-semibold">Kernel Version</td>
              <td className="py-2 text-right font-mono">{systemInfo.kernelVersion}</td>
            </tr>
            <tr className="border-t">
              <td className="py-2 font-semibold">Operating System</td>
              <td className="py-2 text-right">{systemInfo.osVersion}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
