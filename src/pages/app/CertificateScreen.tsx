import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { buildVerifyUrl } from '../../utils/verifyUrl';

const TEMPLATE_URL = '/assets/surakshaar-certificate-template.png';

export default function CertificateScreen() {
  const { state, setScreen, t } = useApp();
  const [showDetails, setShowDetails] = useState(false);
  const worker = state.worker;
  const module = state.modules.find((item) => item.id === state.lastCertificateModuleId);
  const correct = state.lastQuizScore;
  const percentage = Math.round((correct / 5) * 100);
  const certId = state.lastCertificateId || `surakshaar-${worker?.workerId || 'worker'}`;
  const certNumber = state.lastCertificateNumber || `SAR-26041-${new Date().getFullYear()}-00000`;
  const issuedDate = state.lastCertificateIssuedAt || new Date().toISOString();
  const userName = worker?.name || 'Worker';
  const moduleTitle = module?.title || t('fireExplosion');
  const issuedDateLabel = useMemo(() => formatIssuedDate(issuedDate), [issuedDate]);

  return (
    <div className="min-h-screen bg-surface-800 px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
          <button onClick={() => setScreen('home')} className="btn-secondary !w-auto !px-4">
            Back
          </button>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            {t('certificateOfCompletion')}
          </p>
          <button onClick={() => window.print()} className="btn-primary !w-auto !px-4 text-xs">
            Print / Save PDF
          </button>
        </div>

        {/* The supplied artwork stays untouched; only its personal fields are overlaid. */}
        <div className="group relative mx-auto aspect-[1184/1320] w-full overflow-hidden shadow-2xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
          <img
            src={TEMPLATE_URL}
            alt="SurakshaAR certificate template"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Name */}
          <div className="absolute left-[28%] top-[33.5%] flex h-[6%] w-[46%] items-center justify-center bg-[#fdfdfb]/95 px-2 text-center">
            <span className="font-serif text-[clamp(12px,4.2vw,48px)] font-bold leading-none text-[#0b342c]">
              {userName}
            </span>
          </div>

          {/* Module title */}
          <div className="absolute left-[25%] top-[43.5%] flex h-[4.2%] w-[50%] items-center justify-center bg-[#fdfdfb]/95 px-2 text-center">
            <span className="font-serif text-[clamp(8px,2.3vw,28px)] font-bold leading-none text-[#0b342c]">
              {moduleTitle}
            </span>
          </div>

          {/* Score */}
          <div className="absolute left-[18.2%] top-[59.35%] flex h-[3.4%] w-[12.5%] items-center justify-center bg-[#fdfdfb]/95">
            <span className="font-serif text-[clamp(10px,2.8vw,32px)] font-bold leading-none text-[#101820]">
              {percentage}%
            </span>
          </div>

          {/* Issued date */}
          <div className="absolute left-[45.8%] top-[59.35%] flex h-[3.4%] w-[18.5%] items-center justify-center bg-[#fdfdfb]/95 px-1">
            <span className="whitespace-nowrap font-serif text-[clamp(7px,1.8vw,22px)] font-bold leading-none text-[#101820]">
              {issuedDateLabel}
            </span>
          </div>

          {/* Certificate number */}
          <div className="absolute left-[74.8%] top-[59.35%] flex h-[3.4%] w-[22%] items-center justify-start bg-[#fdfdfb]/95 px-1">
            <span className="whitespace-nowrap font-serif text-[clamp(5px,1.25vw,16px)] font-bold leading-none text-[#101820]">
              {certNumber}
            </span>
          </div>

          {/* Dynamic QR replaces the sample QR in the reference artwork. */}
          <Link
            to={`/verify/${certId}`}
            aria-label="Verify certificate QR"
            className="absolute left-[42.1%] top-[63.65%] flex h-[14.5%] w-[16.7%] items-center justify-center rounded-[4%] bg-white p-[1.15%] transition duration-300 hover:scale-110 hover:shadow-[0_0_22px_rgba(34,197,94,0.55)]"
          >
            <QRCodeSVG value={buildVerifyUrl(certId)} size={256} className="h-full w-full" />
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2 print:hidden">
          <Link to={`/verify/${certId}`} className="btn-secondary !w-auto !px-5 text-xs">
            Verify Certificate Online
          </Link>
          <button
            type="button"
            onClick={() => setShowDetails((visible) => !visible)}
            aria-expanded={showDetails}
            className="btn-secondary !w-auto !px-5 text-xs"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>

        {showDetails && (
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-surface-700/90 p-3 text-xs animate-slide-up print:hidden">
            <Detail label="Issued to" value={userName} />
            <Detail label="Score" value={`${percentage}%`} />
            <Detail label="Issued date" value={issuedDateLabel} />
            <Detail label="Certificate no." value={certNumber} />
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/15 px-3 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 truncate font-semibold text-white" title={value}>{value}</p>
    </div>
  );
}

function formatIssuedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
