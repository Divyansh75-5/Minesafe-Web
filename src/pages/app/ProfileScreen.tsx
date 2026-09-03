import { useApp } from '../../context/AppContext';
import BottomNav from '../../components/ui/BottomNav';
import Header from '../../components/ui/Header';

export default function ProfileScreen() {
  const { state, t } = useApp();
  const { worker, modules, certificatesEarned, language } = state;

  const langNames: Record<string, string> = { en: 'English', hi: '\u0939\u093F\u0928\u094D\u0926\u0940', sat: 'Santali' };

  const completedModules = modules.filter(m => m.status === 'completed');

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-surface-800 pb-20">
      <Header title={t('profile')} />

      <div className="px-5 pb-6 space-y-5">
        {/* Worker card */}
        <div className="surface-card flex items-center gap-4 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center flex-shrink-0 shadow-glow-orange">
            <span className="text-xl font-black text-white">{worker?.name?.[0] || 'W'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{worker?.name || 'Worker'}</h2>
            <p className="text-muted text-xs mt-0.5">{worker?.workerId}</p>
            <p className="text-muted text-xs">{worker?.industry}</p>
          </div>
        </div>

        {/* Worker info */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{t('workerInformation')}</h3>
          <div className="surface-card space-y-0 divide-y divide-white/[0.06]">
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm text-subtle">{t('workerId')}</span>
              <span className="text-sm text-white font-semibold font-mono">{worker?.workerId || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm text-subtle">{t('name')}</span>
              <span className="text-sm text-white font-semibold">{worker?.name || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm text-subtle">{t('industry')}</span>
              <span className="text-sm text-white font-semibold">{worker?.industry || '-'}</span>
            </div>
          </div>
        </div>

        {/* Completed training */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{t('completedTraining')}</h3>
          <div className="surface-card">
            {completedModules.length > 0 ? (
              <div className="space-y-3">
                {completedModules.map((mod) => (
                  <div key={mod.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-safe/10 flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-semibold">{mod.title}</p>
                      <p className="text-[10px] text-muted">{mod.completedScenarios}/{mod.totalScenarios} {t('scenarios')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted py-2">No training completed yet</p>
            )}
          </div>
        </div>

        {/* Certificates */}
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{t('certificates')}</h3>
          <div className="surface-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-caution/10 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-white font-semibold">{certificatesEarned} {t('earned')}</p>
                <p className="text-[10px] text-muted">Fire Safety Module</p>
              </div>
            </div>
          </div>
        </div>

        {/* Language & Status */}
        <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="surface-card space-y-0 divide-y divide-white/[0.06]">
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm text-subtle">{t('language')}</span>
              <span className="text-sm text-white font-semibold">{langNames[language] || language}</span>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm text-subtle">{t('offlineStatus')}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-safe" />
                <span className="text-sm text-safe font-semibold">{t('synced')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
