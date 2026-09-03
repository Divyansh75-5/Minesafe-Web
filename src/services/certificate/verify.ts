import { doc, getDoc } from 'firebase/firestore';
import { getDbInstance, isFirebaseConfigured } from '../firebase/config';
import { demoCertificates } from '../demoData';
import type { Certificate } from '../../types/models';

export interface VerificationResult {
  certificate: Certificate | null;
  status: 'valid' | 'invalid' | 'revoked' | 'expired' | 'not-found';
}

/**
 * Verifies a certificate by its id (the Firestore document id, also the QR value) or by its
 * certificate number (MS-26041-YYYY-#####). Works live against Firestore when configured, or
 * against seeded demo certificates otherwise.
 */
export async function verifyCertificate(
  certIdOrNumber: string
): Promise<VerificationResult> {
  const input = certIdOrNumber.trim();

  // Strip a full verification URL down to the id segment so a scanned QR resolves at any origin.
  let id = input;
  if (input.includes('/verify/')) {
    id = input.split('/verify/').pop() ?? '';
    // Guard against trailing slash / query / hash from mobile scanners.
    id = id.replace(/[/?#].*$/, '');
  }

  if (isFirebaseConfigured()) {
    const db = getDbInstance();
    let snap = await getDoc(doc(db, 'certificates', id)).catch(() => null);
    if (!snap?.exists()) {
      // Not a direct id — try a number lookup against the seeded set (or a query in live mode).
      const byNumber = demoCertificates.find((c) => c.certificateNumber === id);
      if (byNumber) return summarize(byNumber);
      return { certificate: null, status: 'not-found' };
    }
    return summarize(snap.data() as Certificate);
  }

  // Demo mode: search seeded certificates by id, number, or QR value.
  const cert =
    demoCertificates.find((c) => c.id === id) ??
    demoCertificates.find((c) => c.certificateNumber === id) ??
    demoCertificates.find((c) => c.qrCodeData === input);

  if (!cert) {
    return { certificate: null, status: 'not-found' };
  }
  return summarize(cert);
}

function summarize(cert: Certificate): VerificationResult {
  if (cert.status === 'revoked') {
    return { certificate: cert, status: 'revoked' };
  }
  if (cert.expiresAt && new Date() > new Date(cert.expiresAt)) {
    return { certificate: cert, status: 'expired' };
  }
  return { certificate: cert, status: 'valid' };
}

export function extractCertId(certificateNumber: string): string | null {
  // Format: MS-26041-YYYY-NNNNN
  const match = certificateNumber.match(/^MS-26041-\d{4}-\d{5}$/);
  if (!match) return null;
  // Resolve the number to a document in demo mode so the detail page can render.
  const cert = demoCertificates.find((c) => c.certificateNumber === certificateNumber);
  return cert?.id ?? certificateNumber;
}
