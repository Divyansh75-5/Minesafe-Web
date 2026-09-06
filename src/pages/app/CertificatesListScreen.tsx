import { useApp } from '../../context/AppContext';
import BottomNav from '../../components/ui/BottomNav';
import Header from '../../components/ui/Header';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/cn';

export default function CertificatesListScreen() {
  const { state, setScreen, t } = useApp();
  const { certificatesEarned } = state;

  const certs = certificatesEarned > 0 && state.lastCertificateId && state.lastCertificateNumber
    ? [{
        id: state.lastCertificateId,
        number: state.lastCertificateNumber,
        module: state.modules.find((item) => item.id === state.lastCertificateModuleId)?.title || 'Safety Training',
        date: formatDate(state.lastCertificateIssuedAt || undefined),
        score: Math.round((state.lastQuizScore / 5) * 100),
        status: 'valid' as const,
      }]
    : [];

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-surface-800 pb-20">
      <Header title={t('certificates')} />

      <div className="px-5 pb-6">
        {certs.length > 0 ? (
          <div className="space-y-4">
            {certs.map((cert, i) => (
              <Link
                key={cert.id}
                to={`/verify/${cert.id}`}
                className="block surface-card interactive-card cursor-pointer animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">{cert.module}</p>
                    <p className="text-muted text-xs mt-0.5">Issued: {cert.date}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-semibold text-accent">{cert.score}%</span>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-safe" />
                        <span className="text-[10px] text-safe font-semibold uppercase">{cert.status}</span>
                      </div>
                    </div>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted flex-shrink-0 mt-1">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-surface-600 border border-white/[0.06] flex items-center justify-center mb-5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Certificates Yet</h3>
            <p className="text-muted text-sm max-w-[240px]">Complete training modules to earn safety certificates</p>
            <button
              onClick={() => setScreen('modules')}
              className="btn-primary mt-6 max-w-[200px]"
            >
              Start Training
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
