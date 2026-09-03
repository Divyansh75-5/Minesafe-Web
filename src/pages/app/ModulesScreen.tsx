import { useApp } from '../../context/AppContext';
import BottomNav from '../../components/ui/BottomNav';
import Header from '../../components/ui/Header';

export default function ModulesScreen() {
  const { state, startModule, t } = useApp();
  const { modules } = state;

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-surface-800 pb-20">
      <Header title={t('training')} />

      <div className="px-5 pb-6 space-y-5">
        {modules.map((mod, i) => (
          <div
            key={mod.id}
            className="surface-card overflow-hidden animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${mod.color}18` }}
              >
                {mod.icon === 'fire' ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={mod.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={mod.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12h.01" /><path d="M15 12h.01" />
                    <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
                    <path d="M19 6c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white">{mod.title}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                    {t('duration')}: {mod.duration}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-surface-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: mod.color }}>
                    {t(mod.difficulty)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted font-medium">
                  {mod.completedScenarios}/{mod.totalScenarios} {t('scenarios')} {t('completed')}
                </span>
                <span className="text-xs font-bold" style={{ color: mod.color }}>{mod.progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${mod.progress}%`, backgroundColor: mod.color }}
                />
              </div>
            </div>

            <button
              onClick={() => startModule(mod.id)}
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
              style={{
                backgroundColor: `${mod.color}15`,
                color: mod.color,
                border: `1px solid ${mod.color}30`,
              }}
            >
              {mod.status === 'completed' ? t('completed') : mod.status === 'in-progress' ? t('resumeTraining') : t('startTraining')}
              {mod.status !== 'completed' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
