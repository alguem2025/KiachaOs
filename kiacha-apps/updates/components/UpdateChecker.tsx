import React, { useState, useEffect } from 'react';

interface Update {
  component: string;
  current_version: string;
  available_version: string;
  critical: boolean;
}

export function UpdateChecker() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);

  const checkForUpdates = async () => {
    setChecking(true);
    const data = await fetch('/api/updates/check').then(r => r.json());
    setUpdates(data.updates || []);
    setChecking(false);
  };

  const installUpdate = async (component: string, version: string) => {
    setInstalling(component);
    await fetch('/api/updates/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ component, version }),
    });
    setInstalling(null);
    checkForUpdates();
  };

  useEffect(() => {
    checkForUpdates();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">🔄 Kiacha Updates</h1>

      <button
        onClick={checkForUpdates}
        disabled={checking}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {checking ? 'Checking...' : 'Check for Updates'}
      </button>

      {updates.length === 0 && !checking && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <p className="text-green-900">✓ System is up to date</p>
        </div>
      )}

      <div className="space-y-3">
        {updates.map(update => (
          <div
            key={update.component}
            className={`p-4 rounded-lg border ${update.critical ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{update.component}</h3>
                <p className="text-sm text-gray-600">
                  {update.current_version} → {update.available_version}
                </p>
                {update.critical && <p className="text-sm text-red-600 font-semibold">⚠️ Critical Update</p>}
              </div>
              <button
                onClick={() => installUpdate(update.component, update.available_version)}
                disabled={installing === update.component}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {installing === update.component ? 'Installing...' : 'Install'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
