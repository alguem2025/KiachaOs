import React, { useState, useEffect } from 'react';

interface NetworkStatusData {
  primary_interface: string;
  connected: boolean;
  ipv4: string;
  interfaces: Array<{
    name: string;
    status: string;
    ipv4: string;
    mac_address: string;
  }>;
}

export function NetworkStatus() {
  const [status, setStatus] = useState<NetworkStatusData | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/network/status')
        .then(r => r.json())
        .then(setStatus);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return <div className="p-6">Loading network status...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">🌐 Network Status</h1>

      {/* Connection Status */}
      <div className={`p-4 rounded-lg ${status.connected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <h3 className="text-lg font-semibold">{status.connected ? '✓ Connected' : '✗ Not Connected'}</h3>
        <p className="text-sm mt-2">
          Primary: <span className="font-mono">{status.primary_interface}</span>
        </p>
        <p className="text-sm">IP Address: <span className="font-mono">{status.ipv4}</span></p>
      </div>

      {/* Network Interfaces */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Network Interfaces</h3>
        <div className="space-y-3">
          {status.interfaces.map(iface => (
            <div key={iface.name} className="border rounded p-3">
              <p className="font-semibold">{iface.name}</p>
              <p className="text-sm text-gray-600">Status: {iface.status}</p>
              <p className="text-sm text-gray-600 font-mono">IPv4: {iface.ipv4}</p>
              <p className="text-sm text-gray-600 font-mono">MAC: {iface.mac_address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
