export type LanguageCode = 'en' | 'hi' | 'sat';
export type UserRole = 'worker' | 'admin' | 'supervisor';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  language: LanguageCode;
  region: string;
  organization?: string;
  employeeId?: string;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

export interface LocalizedString {
  en: string;
  hi: string;
  sat: string;
}

export interface ScenarioConfig {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  type: 'detection' | 'action' | 'navigation' | 'quiz';
  difficulty: 'easy' | 'medium' | 'hard';
  maxScore: number;
  timeLimitSeconds?: number;
  successCriteria: string[];
}

export interface TrainingModule {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  version: string;
  order: number;
  estimatedDurationMinutes: number;
  passingScore: number;
  scenarios: ScenarioConfig[];
  isActive: boolean;
}

export interface ActionRecord {
  actionId: string;
  actionType: 'interaction' | 'movement' | 'observation' | 'decision';
  timestamp: Date;
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number; w: number };
  success: boolean;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface ScenarioProgress {
  scenarioId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'failed';
  score: number;
  maxScore: number;
  actions: ActionRecord[];
  startedAt?: Date;
  completedAt?: Date;
  timeSpentSeconds: number;
  attempts: number;
}

export interface TrainingSession {
  id: string;
  userId: string;
  moduleId: string;
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  scenarioProgress: ScenarioProgress[];
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  passed: boolean;
  certificateId?: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  userId: string;
  userName: string;
  userEmployeeId?: string;
  moduleId: string;
  moduleTitle: LocalizedString;
  score: number;
  maxScore: number;
  percentage: number;
  issuedAt: Date;
  expiresAt?: Date;
  qrCodeData: string;
  qrCodeImageUrl: string;
  pdfUrl: string;
  verificationHash: string;
  status: 'valid' | 'revoked' | 'expired';
  issuedBy: string;
}

export interface AdminAnalytics {
  totalWorkers: number;
  activeWorkers: number;
  completedSessions: number;
  passRate: number;
  averageScore: number;
  moduleStats: ModuleStat[];
  regionStats: RegionStat[];
  languageStats: Array<{ language: LanguageCode; count: number }>;
  dailyCompletions: Array<{ date: string; count: number }>;
}

export interface ModuleStat {
  moduleId: string;
  attempts: number;
  completions: number;
  passRate: number;
  averageScore: number;
  averageTimeMinutes: number;
}

export interface RegionStat {
  region: string;
  workerCount: number;
  completionRate: number;
}
