import { useApp } from '../../context/AppContext';
import BottomNav from '../../components/ui/BottomNav';

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="relative w-28 h-28">
      <svg width="112" height="112" viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
        <circle
          cx="40" cy="40" r="36"
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white">{score}</span>
        <span className="text-[10px] text-muted font-semibold -mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const { state, setScreen, t } = useApp();
  const { worker, modules, overallScore, certificatesEarned, totalModules } = state;

  const completedCount = modules.filter(m => m.status === 'completed').length;
  const pendingCount = totalModules - completedCount;
  const scoreLabel = overallScore >= 80 ? t('excellent') : overallScore >= 50 ? t('good') : t('needsImprovement');
  const scoreColor = overallScore >= 80 ? 'text-safe' : overallScore >= 50 ? 'text-caution' : 'text-danger';

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-surface-800 pb-20">
      <div className="px-5 pt-6 pb-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted text-xs font-semibold uppercase tracking-wider">Welcome back</p>
            <h1 className="text-xl font-black text-white mt-0.5">{worker?.name || 'Worker'}</h1>
            <p className="text-muted text-xs mt-0.5">{worker?.workerId} &middot; {worker?.industry}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-surface-500 border border-white/[0.08] flex items-center justify-center">
            <span className="text-lg font-bold text-accent">{worker?.name?.[0] || 'W'}</span>
          </div>
        </div>
      </div>

      <div className="px-5 animate-slide-up">
        <div className="surface-card flex items-center gap-5">
          <ScoreRing score={overallScore} />
          <div className="flex-1">
            <p className="text-muted text-xs font-semibold uppercase tracking-wider">{t('safetyScore')}</p>
            <p className={`text-2xl font-black mt-0.5 ${scoreColor}`}>{scoreLabel}</p>
            <div className="progress-bar mt-3">
              <div
                className="progress-bar-fill bg-gradient-to-r from-accent to-caution"
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="grid grid-cols-3 gap-3">
          <div className="surface-card-sm text-center">
            <p className="text-2xl font-black text-white">{completedCount}</p>
            <p className="text-[10px] text-muted font-semibold mt-0.5">{t('modulesCompleted')}</p>
          </div>
          <div className="surface-card-sm text-center">
            <p className="text-2xl font-black text-white">{pendingCount}</p>
            <p className="text-[10px] text-muted font-semibold mt-0.5">{t('pendingModules')}</p>
          </div>
          <div className="surface-card-sm text-center">
            <p className="text-2xl font-black text-caution">{certificatesEarned}</p>
            <p className="text-[10px] text-muted font-semibold mt-0.5">{t('earned')}</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5 animate-slide-up" style={{ animationDelay: '150ms' }}>
        <button
          onClick={() => setScreen('modules')}
          className="btn-primary flex items-center justify-center gap-3"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
          {t('continueTraining')}
        </button>
      </div>

      <div className="px-5 mt-5">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {t('trainingProgress')}
        </h3>
        <div className="space-y-3">
          {modules.map((mod, i) => (
            <div
              key={mod.id}
              className="surface-card-sm flex items-center gap-4 cursor-pointer hover:bg-surface-500 transition-colors active:scale-[0.99] animate-slide-up"
              style={{ animationDelay: `${250 + i * 80}ms` }}
              onClick={() => {
                if (mod.status === 'in-progress' || mod.status === 'available') {
                  setScreen(mod.id === 'fire' ? 'fire-ar' : 'gas-ar');
                }
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${mod.color}15` }}
              >
                {mod.icon === 'fire' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={mod.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={mod.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12h.01" /><path d="M15 12h.01" /><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
                    <path d="M19 6c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{mod.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="progress-bar flex-1 h-1.5">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${mod.progress}%`, backgroundColor: mod.color }}
                    />
                  </div>
                  <span className="text-[10px] text-muted font-semibold whitespace-nowrap">{mod.progress}%</span>
                </div>
                <p className="text-muted text-[10px] mt-1">
                  {mod.completedScenarios}/{mod.totalScenarios} {t('scenarios')} &middot; {mod.duration}
                </p>
              </div>
              <div className="flex-shrink-0">
                {mod.status === 'completed' ? (
                  <div className="w-8 h-8 rounded-full bg-safe/10 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
