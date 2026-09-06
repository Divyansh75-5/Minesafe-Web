import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { verifyCertificate, type VerificationResult } from '../../services/certificate/verify';
import { buildVerifyUrl } from '../../utils/verifyUrl';

const TEMPLATE_URL = '/assets/surakshaar-certificate-template.png';

export default function CertificateDetail() {
  const { certId } = useParams<{ certId: string }>();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certId) return;
    verifyCertificate(certId).then((verification) => {
      setResult(verification);
      setLoading(false);
    });
  }, [certId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!result || result.status === 'not-found' || !result.certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-4 text-2xl">✕</div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Not Found</h1>
          <p className="text-gray-600 mt-2">We could not find a certificate matching this number.</p>
        </div>
      </div>
    );
  }

  const cert = result.certificate;
  const isValid = result.status === 'valid';
  const moduleTitle = cert.moduleTitle?.en || 'Safety Training';
  const percentage = cert.percentage ?? Math.round((cert.score / Math.max(cert.maxScore, 1)) * 100);

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-8 sm:px-6">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              isValid ? 'bg-green-100 text-green-800' : result.status === 'revoked' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isValid ? '✓' : '⚠'} {result.status.toUpperCase()}
            </div>
            <p className="mt-2 text-sm text-gray-500">Certificate #{cert.certificateNumber}</p>
          </div>
          <button onClick={() => window.print()} className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-700">
            Print / Save PDF
          </button>
        </div>

        <div className="relative mx-auto aspect-[1184/1320] w-full overflow-hidden bg-white shadow-2xl">
          <img src={TEMPLATE_URL} alt="SurakshaAR certificate" className="absolute inset-0 h-full w-full object-cover" />

          <div className="absolute left-[28%] top-[33.5%] flex h-[6%] w-[46%] items-center justify-center bg-[#fdfdfb]/95 px-2 text-center">
            <span className="font-serif text-[clamp(12px,4.2vw,48px)] font-bold leading-none text-[#0b342c]">{cert.userName}</span>
          </div>

          <div className="absolute left-[25%] top-[43.5%] flex h-[4.2%] w-[50%] items-center justify-center bg-[#fdfdfb]/95 px-2 text-center">
            <span className="font-serif text-[clamp(8px,2.3vw,28px)] font-bold leading-none text-[#0b342c]">{moduleTitle}</span>
          </div>

          <div className="absolute left-[18.2%] top-[59.35%] flex h-[3.4%] w-[12.5%] items-center justify-center bg-[#fdfdfb]/95">
            <span className="font-serif text-[clamp(10px,2.8vw,32px)] font-bold leading-none text-[#101820]">{percentage}%</span>
          </div>

          <div className="absolute left-[45.8%] top-[59.35%] flex h-[3.4%] w-[18.5%] items-center justify-center bg-[#fdfdfb]/95 px-1">
            <span className="whitespace-nowrap font-serif text-[clamp(7px,1.8vw,22px)] font-bold leading-none text-[#101820]">
              {formatIssuedDate(cert.issuedAt)}
            </span>
          </div>

          <div className="absolute left-[74.8%] top-[59.35%] flex h-[3.4%] w-[22%] items-center justify-start bg-[#fdfdfb]/95 px-1">
            <span className="whitespace-nowrap font-serif text-[clamp(5px,1.25vw,16px)] font-bold leading-none text-[#101820]">
              {cert.certificateNumber}
            </span>
          </div>

          <a
            href={buildVerifyUrl(cert.id)}
            aria-label="Certificate verification QR"
            className="absolute left-[42.1%] top-[63.65%] flex h-[14.5%] w-[16.7%] items-center justify-center rounded-[4%] bg-white p-[1.15%]"
          >
            <QRCodeSVG value={buildVerifyUrl(cert.id)} size={256} className="h-full w-full" />
          </a>
        </div>

        <div className="mt-5 text-center print:hidden">
          <p className="text-sm text-gray-500">Scan the QR code to verify this certificate.</p>
          <p className="mt-1 text-xs font-semibold text-green-700">SurakshaAR verified training record</p>
        </div>
      </div>
    </div>
  );
}

function formatIssuedDate(value: Date | string | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
