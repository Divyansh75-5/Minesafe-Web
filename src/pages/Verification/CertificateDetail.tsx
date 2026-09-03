import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { verifyCertificate, type VerificationResult } from '../../services/certificate/verify';
import { formatDate } from '../../utils/cn';
import { buildVerifyUrl } from '../../utils/verifyUrl';

export default function CertificateDetail() {
  const { certId } = useParams<{ certId: string }>();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certId) return;
    verifyCertificate(certId).then((r) => {
      setResult(r);
      setLoading(false);
    });
  }, [certId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!result || result.status === 'not-found' || !result.certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            ✕
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Not Found</h1>
          <p className="text-gray-600 mt-2">
            We could not find a certificate matching this number.
          </p>
        </div>
      </div>
    );
  }

  const cert = result.certificate;
  const isValid = result.status === 'valid';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-2 ${
              isValid
                ? 'bg-green-100 text-green-800'
                : result.status === 'revoked'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {isValid ? '✓' : '⚠'} {result.status.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isValid ? 'Valid Certificate' : 'Certificate Issue'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Certificate #{cert.certificateNumber}
          </p>
        </div>

        <div className="card text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-primary-600 rounded-2xl flex items-center justify-center mb-4">
              🦺
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{cert.userName}</h2>
            <p className="text-gray-600 mt-1">{cert.moduleTitle?.en}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500">Score</div>
              <div className="text-xl font-bold">{cert.percentage}%</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500">Issued Date</div>
              <div className="text-xl font-bold">{formatDate(cert.issuedAt)}</div>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-white border-2 rounded-lg p-4">
              <QRCodeSVG
                value={buildVerifyUrl(cert.id)}
                size={160}
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Scan QR to verify this certificate
          </p>

          {cert.pdfUrl && (
            <div className="mt-6">
              <a
                href={cert.pdfUrl}
                download
                className="btn-primary inline-block"
              >
                Download Certificate PDF
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}