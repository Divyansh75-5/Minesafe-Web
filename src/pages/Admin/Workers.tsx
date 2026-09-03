import { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';

export default function AdminWorkers() {
  const { users, loading } = useUsers();
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.region?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
        <div className="flex gap-3">
          <input
            className="input max-w-xs"
            placeholder="Search workers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-primary">Export CSV</button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Region</th>
                  <th>Organization</th>
                  <th>Language</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.length === 0 && (
                  <tr>
                    <td className="text-center text-gray-400 py-8">
                      No workers found
                    </td>
                  </tr>
                )}
                {filtered.map((u) => (
                  <tr key={u.uid} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                          {u.displayName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <div className="font-medium">{u.displayName}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{u.region || '-'}</td>
                    <td className="text-sm">{u.organization || '-'}</td>
                    <td>
                      <span className="text-sm uppercase">{u.language}</span>
                    </td>
                    <td>
                      <span
                        className={
                          u.isActive
                            ? 'badge-pass'
                            : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600'
                        }
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}