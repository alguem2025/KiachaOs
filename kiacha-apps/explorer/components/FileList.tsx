import React, { useState, useEffect } from 'react';

interface FileEntry {
  name: string;
  is_dir: boolean;
  size: number;
  modified: number;
  permissions: string;
}

interface FileListProps {
  path?: string;
}

export function FileList({ path = '/home' }: FileListProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [currentPath, setCurrentPath] = useState(path);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/explorer/list?path=${encodeURIComponent(currentPath)}`)
      .then(r => r.json())
      .then(data => {
        setFiles(data.entries || []);
        setLoading(false);
      });
  }, [currentPath]);

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const fullPath = `${currentPath}/${name}`;
    await fetch(`/api/explorer/delete?path=${encodeURIComponent(fullPath)}`, {
      method: 'DELETE',
    });
    setFiles(files.filter(f => f.name !== name));
  };

  const handleNavigate = (name: string) => {
    if (name.startsWith('/')) {
      setCurrentPath(name);
    } else {
      setCurrentPath(`${currentPath}/${name}`);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">📂 Kiacha Explorer</h1>

      {/* Breadcrumb */}
      <div className="bg-gray-100 p-3 rounded font-mono text-sm">
        {currentPath}
      </div>

      {loading && <div>Loading...</div>}

      {/* File List */}
      <div className="grid gap-2">
        {files.map(file => (
          <div
            key={file.name}
            className="flex items-center justify-between p-3 bg-white border rounded hover:bg-gray-50"
          >
            <div className="flex items-center gap-3 flex-1">
              {file.is_dir ? '📁' : '📄'}
              <div>
                <p
                  className="font-semibold cursor-pointer hover:text-blue-600"
                  onClick={() => file.is_dir && handleNavigate(file.name)}
                >
                  {file.name}
                </p>
                {!file.is_dir && (
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB • Modified: {new Date(file.modified * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDelete(file.name)}
              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
