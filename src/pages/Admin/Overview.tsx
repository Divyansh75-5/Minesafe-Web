import { StatCard } from '../../components/ui/StatCard';
import { useSessions } from '../../hooks/useSessions';
import { useUsers } from '../../hooks/useUsers';

export default function AdminOverview() {
  const { sessions, loading: sessionsLoading } = useSessions();
  const { users } = useUsers();

  const completed = sessions.filter((s) => s.status === 'completed');
  const passedCount = completed.filter((s) => s.passed).length;
  const avgScore = completed.length
    ? completed.reduce((acc, s) => acc + s.percentageScore, 0) / completed.length
    : 0;

  const stats = [
    {
      label: 'Total Workers',
      value: users.filter((u) => u.role === 'worker').length,
      icon: '👷',
    },
    {
      label: 'Completed Sessions',
      value: completed.length,
      icon: '✅',
    },
    {
      label: 'Pass Rate',
      value: completed.length ? `${((passedCount / completed.length) * 100).toFixed(1)}%` : '0%',
      icon: '🎯',
    },
    {
      label: 'Average Score',
      value: `${avgScore.toFixed(1)}%`,
      icon: '📈',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {sessionsLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : sessions.length === 0 ? (
              <p className="text-gray-400">No sessions yet</p>
            ) : (
              sessions.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm">{s.moduleId}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(s.startedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={
                      s.passed
                        ? 'badge-pass'
                        : 'badge-fail'
                    }
                  >
                    {s.percentageScore.toFixed(0)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Module Performance</h2>
          <div className="space-y-4">
            {['fire-safety', 'gas-leak'].map((m) => {
              const moduleSessions = completed.filter((s) => s.moduleId === m);
              const modulePassed = moduleSessions.filter((s) => s.passed).length;
              const passRate = moduleSessions.length
                ? ((modulePassed / moduleSessions.length) * 100).toFixed(0)
                : '0';

              return (
                <div
                  key={m}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium capitalize">
                      {m.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {moduleSessions.length} attempts
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${passRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{passRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}