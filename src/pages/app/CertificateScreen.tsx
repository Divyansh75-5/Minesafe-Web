import { useApp } from '../../context/AppContext';
import Header from '../../components/ui/Header';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { demoCertificates } from '../../services/demoData';
import { buildVerifyUrl } from '../../utils/verifyUrl';

export default function CertificateScreen() {
  const { state, setScreen, t } = useApp();
  const worker = state.worker;
  // Deterministically pick a real seeded demo certificate so the verify link always resolves
  // to a certificate that actually exists in demo mode.
  const seed = demoCertificates;
  const idx = Math.abs((worker?.workerId || 'w1').length * 31 + (worker?.name || '').length * 17) % seed.length;
  const cert = seed[idx];
  const certId = cert?.id || 'cert-fire-w1-s1';
  const userName = cert?.userName || worker?.name || 'Worker';
  const moduleTitle = cert?.moduleTitle?.en || t('fireExplosion');
  const certNumber = cert?.certificateNumber || certId;
  const verifyUrl = `/verify/${certId}`;

  return (
    <div className="mobile-shell flex flex-col min-h-screen bg-surface-800 px-5 pt-4 pb-10">
      <Header title={t('certificateOfCompletion')} showBack />

      <div className="flex-1 flex flex-col items-center justify-center py-4 animate-slide-up">
        {/* Certificate Card */}
        <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, #1a222c 0%, #0f1419 50%, #1a1f2e 100%)',
          border: '1px solid rgba(249,115,22,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(249,115,22,0.08)',
        }}>
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-accent via-caution to-accent" />

          <div className="p-8 text-center">
            {/* Shield icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center mx-auto mb-4 shadow-glow-orange">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
              </svg>
            </div>

            <h2 className="text-xl font-black text-white">{t('certificateOfCompletion')}</h2>
            <p className="text-muted text-xs mt-1">MineSafe 26041 &middot; Government of Jharkhand</p>

            <div className="my-6 border-t border-b border-white/[0.06] py-4">
              <p className="text-muted text-xs mb-1">{t('issuedTo')}</p>
              <p className="text-white font-bold text-lg">{userName}</p>
              <p className="text-muted text-xs mt-0.5">{worker?.workerId} &middot; {worker?.industry}</p>
            </div>

            <p className="text-muted text-xs mb-1">{t('forCompleting')}</p>
            <p className="text-white font-semibold text-sm">{moduleTitle}</p>

            <div className="mt-6 flex items-center justify-center gap-4">
              {/* Real scannable QR linking to the (origin-aware) public verification page */}
              <Link to={verifyUrl} aria-label="Verify certificate QR">
                <QRCodeSVG
                  value={buildVerifyUrl(certId)}
                  size={88}
                  bgColor="#ffffff"
                  fgColor="#0f1419"
                />
              </Link>
              <div className="text-left">
                <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">{t('certificateId')}</p>
                <p className="text-white font-mono text-xs font-bold mt-0.5">{certNumber}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
                  <span className="text-safe text-[10px] font-bold">{t('valid')}</span>
                </div>
                <p className="text-[10px] text-muted mt-1">{t('verificationStatus')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <Link to={verifyUrl} className="btn-primary flex items-center justify-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Verify Certificate Online
        </Link>
        <button onClick={() => setScreen('home')} className="btn-secondary">
          {t('home')}
        </button>
      </div>
    </div>
  );
}
