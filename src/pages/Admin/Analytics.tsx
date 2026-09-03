import { useState } from 'react';
import { useSessions } from '../../hooks/useSessions';

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const { sessions } = useSessions();

  const completed = sessions.filter((s) => s.status === 'completed');
  const passed = completed.filter((s) => s.passed).length;
  const avgScore = completed.length
    ? Math.round(
        completed.reduce((a, s) => a + s.percentageScore, 0) / completed.length
      )
    : 0;

  const byModule = ['fire-safety', 'gas-leak'].map((id) => {
    const m = completed.filter((s) => s.moduleId === id);
    const p = m.filter((s) => s.passed).length;
    return {
      module: id,
      attempts: m.length,
      passRate: m.length ? Math.round((p / m.length) * 100) : 0,
      avgScore: m.length
        ? Math.round(m.reduce((a, s) => a + s.percentageScore, 0) / m.length)
        : 0,
    };
  });

  const kpis = [
    { label: 'Total Attempts', value: sessions.length },
    { label: 'Completed', value: completed.length },
    { label: 'Passed', value: passed },
    { label: 'Average Score', value: `${avgScore}%` },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className="card text-center">
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
            <div className="text-sm text-gray-500">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Module Performance</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Module</th>
                <th>Attempts</th>
                <th>Pass Rate</th>
                <th>Average Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {byModule.map((m) => (
                <tr key={m.module}>
                  <td className="font-medium capitalize">
                    {m.module.replace('-', ' ')}
                  </td>
                  <td>{m.attempts}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600"
                          style={{ width: `${m.passRate}%` }}
                        />
                      </div>
                      {m.passRate}%
                    </div>
                  </td>
                  <td>{m.avgScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}