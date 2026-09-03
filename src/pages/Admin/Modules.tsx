import { useState } from 'react';

interface ModuleDisplay {
  id: string;
  title: string;
  description: string;
  scenarios: number;
  passingScore: number;
  isActive: boolean;
}

const defaultModules: ModuleDisplay[] = [
  {
    id: 'fire-safety',
    title: 'Fire & Explosion Safety',
    description:
      'Learn to identify fire classes, select correct extinguishers, and execute safe evacuation.',
    scenarios: 3,
    passingScore: 70,
    isActive: true,
  },
  {
    id: 'gas-leak',
    title: 'Gas Leak / Confined Space',
    description:
      'Gas detection using multi-gas meters, confined space entry procedures, and emergency shutdown.',
    scenarios: 3,
    passingScore: 70,
    isActive: true,
  },
];

export default function AdminModules() {
  const [modules, setModules] = useState(defaultModules);

  const toggleActive = (id: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, isActive: !m.isActive } : m
      )
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Training Modules</h1>
        <button className="btn-primary">+ Add Module</button>
      </div>

      <div className="space-y-4">
        {modules.map((m) => (
          <div
            key={m.id}
            className="card flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold">{m.title}</h3>
                <span
                  className={
                    m.isActive
                      ? 'badge-pass'
                      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600'
                  }
                >
                  {m.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{m.description}</p>
              <div className="flex gap-6 text-sm text-gray-500">
                <span>{m.scenarios} scenarios</span>
                <span>Passing score: {m.passingScore}%</span>
                <span>ID: {m.id}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn-secondary text-sm">Edit</button>
              <button
                onClick={() => toggleActive(m.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  m.isActive
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {m.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}