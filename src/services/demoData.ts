import type {
  UserProfile,
  TrainingSession,
  Certificate,
} from '../types/models';

// Seeded demo data used when Firebase is NOT configured (see services/firebase/config.ts).
// Keeps the SIH demo fully functional and convincing offline-of-Firebase: the admin dashboard,
// analytics, workers list and certificate verification all render real-looking records.

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

export const demoUsers: UserProfile[] = [
  {
    uid: 'demo-w1',
    email: 'ravi-kumar@minesafe.in',
    displayName: 'Ravi Kumar',
    role: 'worker',
    language: 'hi',
    region: 'Jharkhand - Dhanbad',
    organization: 'BCCL - Bastacolla',
    employeeId: 'WRK-1001',
    createdAt: daysAgo(120),
    lastLoginAt: daysAgo(1),
    isActive: true,
  },
  {
    uid: 'demo-w2',
    email: 'suman-mahato@minesafe.in',
    displayName: 'Suman Mahato',
    role: 'worker',
    language: 'sat',
    region: 'Jharkhand - Bokaro',
    organization: 'BCCL - Kargali',
    employeeId: 'WRK-1002',
    createdAt: daysAgo(95),
    lastLoginAt: daysAgo(2),
    isActive: true,
  },
  {
    uid: 'demo-w3',
    email: 'arjun-pradhan@minesafe.in',
    displayName: 'Arjun Pradhan',
    role: 'worker',
    language: 'en',
    region: 'Jharkhand - Ramgarh',
    organization: 'CCL - Rajrappa',
    employeeId: 'WRK-1003',
    createdAt: daysAgo(80),
    lastLoginAt: daysAgo(3),
    isActive: true,
  },
  {
    uid: 'demo-w4',
    email: 'lakshmi-tudu@minesafe.in',
    displayName: 'Lakshmi Tudu',
    role: 'worker',
    language: 'sat',
    region: 'Jharkhand - Giridih',
    organization: 'ECL - Mugma',
    employeeId: 'WRK-1004',
    createdAt: daysAgo(60),
    lastLoginAt: daysAgo(4),
    isActive: false,
  },
];

const simpleSession = (
  id: string,
  userId: string,
  moduleId: string,
  started: Date,
  score: number,
  max: number,
  passed?: boolean
): TrainingSession => {
  const percentage = Math.round((score / max) * 100);
  const didPass = passed ?? percentage >= 70;
  return {
    id,
    userId,
    moduleId,
    status: 'completed',
    startedAt: started,
    completedAt: new Date(started.getTime() + 25 * 60 * 1000),
    scenarioProgress: [],
    totalScore: score,
    maxPossibleScore: max,
    percentageScore: percentage,
    passed: didPass,
    certificateId: didPass ? `${moduleId}-${userId}-${id}` : undefined,
  };
};

export const demoSessions: TrainingSession[] = [
  simpleSession('s1', 'demo-w1', 'fire-safety', daysAgo(28), 92, 100),
  simpleSession('s2', 'demo-w1', 'gas-leak', daysAgo(21), 88, 100),
  simpleSession('s3', 'demo-w2', 'fire-safety', daysAgo(19), 74, 100),
  simpleSession('s4', 'demo-w2', 'gas-leak', daysAgo(12), 65, 100, false),
  simpleSession('s5', 'demo-w3', 'fire-safety', daysAgo(9), 81, 100),
  simpleSession('s6', 'demo-w3', 'gas-leak', daysAgo(4), 90, 100),
  simpleSession('s7', 'demo-w1', 'fire-safety', daysAgo(2), 96, 100),
];

const moduleTitles = {
  'fire-safety': { en: 'Fire & Explosion Safety', hi: 'अग्नि तथा विस्फोट सुरक्षा', sat: 'अग्नि तथा विस्फोट सुरक्षा' },
  'gas-leak': { en: 'Gas Leak / Confined Space', hi: 'गैस रिस्त और संकुशित स्पेस', sat: 'गैस रिस्त और संकुशित स्पेस' },
} as const;

export const demoCertificates: Certificate[] = [
  {
    id: 'cert-fire-w1-s1',
    certificateNumber: 'MS-26041-2026-10001',
    userId: 'demo-w1',
    userName: 'Ravi Kumar',
    userEmployeeId: 'WRK-1001',
    moduleId: 'fire-safety',
    moduleTitle: moduleTitles['fire-safety'],
    score: 92,
    maxScore: 100,
    percentage: 92,
    issuedAt: daysAgo(28),
    qrCodeData: 'https://minesafe-26041.web.app/verify/cert-fire-w1-s1',
    qrCodeImageUrl: '',
    pdfUrl: '',
    verificationHash: 'a3f1c9d0e2b84a7f61c39e0d5a8b2f4c1e7d9a0b3c5f6e7d8a9b0c1d2e3f4a5b6',
    status: 'valid',
    issuedBy: 'system',
  },
  {
    id: 'cert-gas-w1-s2',
    certificateNumber: 'MS-26041-2026-10002',
    userId: 'demo-w1',
    userName: 'Ravi Kumar',
    userEmployeeId: 'WRK-1001',
    moduleId: 'gas-leak',
    moduleTitle: moduleTitles['gas-leak'],
    score: 88,
    maxScore: 100,
    percentage: 88,
    issuedAt: daysAgo(21),
    qrCodeData: 'https://minesafe-26041.web.app/verify/cert-gas-w1-s2',
    qrCodeImageUrl: '',
    pdfUrl: '',
    verificationHash: 'b4a2d0e1f3c95b80e7d4a1f2b6c3e8f9a0d1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
    status: 'valid',
    issuedBy: 'system',
  },
  {
    id: 'cert-fire-w3-s5',
    certificateNumber: 'MS-26041-2026-10003',
    userId: 'demo-w3',
    userName: 'Arjun Pradhan',
    userEmployeeId: 'WRK-1003',
    moduleId: 'fire-safety',
    moduleTitle: moduleTitles['fire-safety'],
    score: 81,
    maxScore: 100,
    percentage: 81,
    issuedAt: daysAgo(9),
    qrCodeData: 'https://minesafe-26041.web.app/verify/cert-fire-w3-s5',
    qrCodeImageUrl: '',
    pdfUrl: '',
    verificationHash: 'c5b3e1f2a4d06c91f8e5b2c3a7d4f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    status: 'valid',
    issuedBy: 'system',
  },
  {
    id: 'cert-fire-w2-s3',
    certificateNumber: 'MS-26041-2026-10004',
    userId: 'demo-w2',
    userName: 'Suman Mahato',
    userEmployeeId: 'WRK-1002',
    moduleId: 'fire-safety',
    moduleTitle: moduleTitles['fire-safety'],
    score: 74,
    maxScore: 100,
    percentage: 74,
    issuedAt: daysAgo(19),
    qrCodeData: 'https://minesafe-26041.web.app/verify/cert-fire-w2-s3',
    qrCodeImageUrl: '',
    pdfUrl: '',
    verificationHash: 'd6c4f2a3b5e17da0f9f6c3d4a8e5a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
    status: 'valid',
    issuedBy: 'system',
  },
];

/** Returns the seeded demo certificates earned by a worker (used by the app certificate screens). */
export function certificatesForWorker(userId: string): Certificate[] {
  return demoCertificates.filter((c) => c.userId === userId && c.status === 'valid');
}
