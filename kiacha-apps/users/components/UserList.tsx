import React, { useState, useEffect } from 'react';

interface User {
  user_id: string;
  username: string;
  display_name: string;
  role: string;
  active: boolean;
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('user');

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => setUsers(data.users || []));
  }, []);

  const handleAddUser = async () => {
    if (!newUsername) return;
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername,
        displayName: newUsername,
        role: newRole,
      }),
    });
    setNewUsername('');
    setUsers([...users, { user_id: `user-${Date.now()}`, username: newUsername, display_name: newUsername, role: newRole, active: true }]);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    setUsers(users.filter(u => u.user_id !== userId));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">👥 User Management</h1>

      {/* Add User */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Create New User</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Username"
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
          <select
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option>user</option>
            <option>admin</option>
            <option>guest</option>
          </select>
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add User
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Users</h3>
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
              <div>
                <p className="font-semibold">{user.display_name}</p>
                <p className="text-sm text-gray-600">{user.username} • {user.role}</p>
              </div>
              <button
                onClick={() => handleDeleteUser(user.user_id)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
