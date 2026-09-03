/**
 * Returns the base URL used to build scannable verification QR codes.
 *
 * Uses the current browser origin at runtime so the QR always points to a reachable host:
 * - localhost / LAN dev server when testing
 * - the deployed Firebase Hosting domain in production
 *
 * Falls back to the production domain if window is unavailable.
 */
export function getVerifyBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://minesafe-26041.web.app';
}

/** Builds the full public verification URL for a certificate id. */
export function buildVerifyUrl(certId: string): string {
  return `${getVerifyBaseUrl()}/verify/${certId}`;
}
