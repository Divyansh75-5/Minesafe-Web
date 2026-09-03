import { useApp } from '../../context/AppContext';

export default function ResultScreen() {
  const { setScreen, t } = useApp();
  const passingScore = 60;
  const total = 5;
  const correct = 4;
  const percentage = Math.round((correct / total) * 100);
  const passed = percentage >= passingScore;

  const competencies = [
    { label: 'Hazard Identification', score: 90, color: '#22c55e' },
    { label: 'Equipment Selection', score: 80, color: '#22c55e' },
    { label: 'Emergency Response', score: 70, color: '#eab308' },
    { label: 'Safety Protocol', score: 85, color: '#22c55e' },
  ];

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-surface-800 px-5 pt-8 pb-10">
      <div className="flex-1 flex flex-col items-center animate-fade-in">
        <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-5 ${passed ? 'bg-safe/10 shadow-glow-green' : 'bg-danger/10 shadow-glow-red'}`}>
          {passed ? (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
            </svg>
          )}
        </div>

        <h1 className={`text-4xl font-black ${passed ? 'text-safe' : 'text-danger'}`}>
          {passed ? t('passed') : t('failed')}
        </h1>

        <div className="mt-6 text-center">
          <p className="text-6xl font-black text-white">{percentage}<span className="text-2xl text-muted">%</span></p>
          <p className="text-muted text-sm mt-1">{correct}/{total} {t('question')} correct</p>
        </div>

        <div className="w-full mt-8">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">{t('competencyBreakdown')}</h3>
          <div className="surface-card space-y-4">
            {competencies.map((c, i) => (
              <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-white font-medium">{c.label}</span>
                  <span className="text-sm font-bold" style={{ color: c.color }}>{c.score}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${c.score}%`, backgroundColor: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
        {passed ? (
          <>
            <button
              onClick={() => setScreen('certificate')}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
              {t('viewCertificate')}
            </button>
            <button onClick={() => setScreen('home')} className="btn-secondary">
              {t('home')}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setScreen('modules')}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              {t('retry')}
            </button>
            <button onClick={() => setScreen('home')} className="btn-secondary">
              {t('home')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
