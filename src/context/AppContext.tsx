import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type LanguageCode = 'en' | 'hi' | 'sat';

export interface WorkerProfile {
  workerId: string;
  name: string;
  industry: string;
  language: LanguageCode;
}

export interface ModuleProgress {
  id: string;
  title: string;
  titleHi: string;
  titleSat: string;
  icon: string;
  progress: number;
  totalScenarios: number;
  completedScenarios: number;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  color: string;
}

export interface AppState {
  screen: string;
  language: LanguageCode;
  worker: WorkerProfile | null;
  modules: ModuleProgress[];
  overallScore: number;
  certificatesEarned: number;
  totalModules: number;
}

const defaultModules: ModuleProgress[] = [
  {
    id: 'fire',
    title: 'Fire & Explosion Safety',
    titleHi: '\u0905\u0917\u094D\u0928\u093F \u0924\u0925\u093E \u0935 \u0935\u093F\u0938\u094D\u092B\u094B\u091F\u0928 \u0938\u0941\u0930\u0915\u094D\u0937\u093E',
    titleSat: '\u1B95\u1B9F\u1BAA \u0924\u0925\u093E \u0935 \u0935\u093F\u0938\u094D\u092B\u094B\u091F\u0928 \u0938\u0941\u0930\u0915\u094D\u0937\u093E',
    icon: 'fire',
    progress: 65,
    totalScenarios: 3,
    completedScenarios: 2,
    difficulty: 'medium',
    duration: '25 min',
    status: 'in-progress',
    color: '#ef4444',
  },
  {
    id: 'gas',
    title: 'Gas Leak & Confined Space',
    titleHi: '\u0917\u0948\u0938 \u0930\u093F\u0938\u094D\u0924 \u0914\u0930 \u0938\u0902\u0915\u0941\u0937\u093F\u0924 \u0938\u094D\u092A\u0947\u0938',
    titleSat: '\u0917\u0948\u0938 \u0930\u093F\u0938\u094D\u0924 \u0914\u0930 \u0938\u0902\u0915\u0941\u0937\u093F\u0924 \u0938\u094D\u092A\u0947\u0938',
    icon: 'gas',
    progress: 0,
    totalScenarios: 3,
    completedScenarios: 0,
    difficulty: 'hard',
    duration: '30 min',
    status: 'available',
    color: '#eab308',
  },
];

const translations = {
  en: {
    industrialSafety: 'Industrial Safety Training',
    selectLanguage: 'Select Language',
    workerId: 'Worker ID',
    name: 'Full Name',
    industry: 'Industry / Workplace',
    continue: 'Continue',
    home: 'Home',
    training: 'Training',
    certificates: 'Certs',
    profile: 'Profile',
    safetyScore: 'Safety Score',
    trainingProgress: 'Training Progress',
    modulesCompleted: 'Modules Done',
    pendingModules: 'Pending',
    continueTraining: 'Continue Training',
    certificateStatus: 'Certificate Status',
    earned: 'Earned',
    notEarned: 'Not Yet',
    startTraining: 'Start Training',
    resumeTraining: 'Resume Training',
    completed: 'Completed',
    scenarios: 'Scenarios',
    difficulty: 'Difficulty',
    duration: 'Duration',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    trainingObjective: 'Training Objective',
    hazardIndicator: 'Hazard Level',
    instructions: 'Instructions',
    tapToAct: 'Tap to Take Action',
    high: 'HIGH',
    medium_label: 'MEDIUM',
    low: 'LOW',
    question: 'Question',
    of: 'of',
    selectAnswer: 'Select the correct answer',
    correct: 'Correct!',
    incorrect: 'Incorrect',
    nextQuestion: 'Next',
    yourScore: 'Your Score',
    passed: 'PASSED',
    failed: 'FAILED',
    competencyBreakdown: 'Competency Breakdown',
    retry: 'Retry Training',
    viewCertificate: 'View Certificate',
    certificateOfCompletion: 'Certificate of Completion',
    issuedTo: 'Issued To',
    forCompleting: 'For successfully completing',
    verificationStatus: 'Verification Status',
    valid: 'Valid',
    certificateId: 'Certificate ID',
    workerInformation: 'Worker Information',
    completedTraining: 'Completed Training',
    language: 'Language',
    offlineStatus: 'Offline Status',
    synced: 'Synced',
    english: 'English',
    hindi: 'Hindi',
    santali: 'Santali',
    fireExplosion: 'Fire & Explosion Safety',
    gasLeak: 'Gas Leak & Confined Space',
    overallSafetyScore: 'Overall Safety Score',
    excellent: 'Excellent',
    good: 'Good',
    needsImprovement: 'Needs Improvement',
  },
  hi: {
    industrialSafety: '\u0909\u0926\u094D\u092F\u094B\u0917\u093F\u0915 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u093E\u0928',
    selectLanguage: '\u092D\u093E\u0937\u093E \u091A\u0941\u0928\u0947\u0902',
    workerId: '\u0915\u0930\u094D\u092E\u091A\u093E\u0930 \u0906\u0908\u0921\u0940',
    name: '\u092A\u0942\u0930\u093E \u0928\u093E\u092E',
    industry: '\u0909\u0926\u094D\u092F\u094B\u0917 \u0938\u094D\u0925\u093E\u0928',
    continue: '\u0906\u0917\u0947 \u092C\u0921\u093C\u0947\u0902',
    home: '\u0939\u094B\u092E',
    training: '\u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u093E\u0928',
    certificates: '\u092A\u094D\u0930\u092E\u093E\u092A\u0924\u094D\u0930',
    profile: '\u092A\u094D\u0930\u094B\u092B\u093E\u0907\u0932',
    safetyScore: '\u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0905\u0902\u0915',
    trainingProgress: '\u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u093E\u0928 \u092A\u094D\u0930\u0917\u0924\u093F',
    modulesCompleted: '\u092E\u0949\u0921\u094D\u0925\u0942\u0932 \u092A\u0942\u0930\u0947',
    pendingModules: '\u0936\u0947\u0937 \u092E\u0947\u0902',
    continueTraining: '\u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u093E\u0928 \u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902',
    certificateStatus: '\u092A\u094D\u0930\u092E\u093E\u092A\u0924\u094D\u0930 \u0938\u094D\u0925\u093F\u0924\u093E',
    earned: '\u092A\u094D\u0930\u093E\u092A\u094D\u0924',
    notEarned: '\u0905\u092D\u0940 \u0928\u0939\u0940\u0902',
    startTraining: '\u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u093E\u0928 \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902',
    resumeTraining: '\u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u093E\u0928 \u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902',
    completed: '\u092A\u0942\u0930\u094D\u0923',
    scenarios: '\u092A\u0930\u093F\u0928\u093E\u092E',
    difficulty: '\u0915\u0920\u093F\u0928\u093E\u0908',
    duration: '\u0905\u0935\u0927\u093F',
    easy: '\u0938\u0939\u0932',
    medium: '\u092E\u0927\u094D\u092F\u092E',
    hard: '\u0915\u0920\u093F\u0928',
    trainingObjective: '\u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u093E\u0928 \u0932\u0915\u094D\u0937\u094D\u092F',
    hazardIndicator: '\u0916\u0924\u0930\u0947 \u0938\u0942\u091A\u0915',
    instructions: '\u0928\u093F\u0930\u094D\u0926\u0947\u0936',
    tapToAct: '\u0915\u093E\u0930\u094D\u0935\u093E\u0907 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u091F\u0948\u092A \u0915\u0930\u0947\u0902',
    high: '\u0909\u091A\u094D\u091A',
    medium_label: '\u092E\u0927\u094D\u092F\u092E',
    low: '\u0915\u092E',
    question: '\u092A\u094D\u0930\u0936\u094D\u0928',
    of: '\u0915\u093E',
    selectAnswer: '\u0938\u0939\u0940 \u0909\u0924\u094D\u0924\u0930 \u091A\u0941\u0928\u0947\u0902',
    correct: '\u0938\u0939\u0940!',
    incorrect: '\u0917\u0932\u0924',
    nextQuestion: '\u0905\u0917\u0932\u093E',
    yourScore: '\u0906\u092A\u0915\u093E \u0938\u0915\u094B\u0930',
    passed: '\u0909\u0924\u094D\u0924\u0940\u0930\u094D\u0923',
    failed: '\u0905\u0928\u0941\u0924\u094D\u0924',
    competencyBreakdown: '\u092F\u094B\u0917\u094D\u092F\u0924\u093E \u0935\u093F\u0935\u0930\u0923',
    retry: '\u092B\u093F\u0930 \u0938\u0947 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902',
    viewCertificate: '\u092A\u094D\u0930\u092E\u093E\u092A\u0924\u094D\u0930 \u0926\u0947\u0916\u0947\u0902',
    certificateOfCompletion: '\u0938\u092E\u093E\u092A\u094D\u0924\u093E \u092A\u094D\u0930\u092E\u093E\u092A\u0924\u094D\u0930',
    issuedTo: '\u091C\u093E\u0930\u0940 \u0915\u093F\u092F\u093E \u0917\u092F\u093E',
    forCompleting: '\u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u092A\u0942\u0930\u094D\u0923 \u0915\u0930\u0928\u0947 \u092A\u0930',
    verificationStatus: '\u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0938\u094D\u0925\u093F\u0924\u093E',
    valid: '\u0935\u0948\u0927',
    certificateId: '\u092A\u094D\u0930\u092E\u093E\u092A\u0924\u094D\u0930 \u0906\u0908\u0921\u0940',
    workerInformation: '\u0915\u0930\u094D\u092E\u091A\u093E\u0930 \u091C\u093E\u0928\u0915\u093E\u0930\u0940',
    completedTraining: '\u092A\u0942\u0930\u094D\u0923 \u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u093E\u0928',
    language: '\u092D\u093E\u0937\u093E',
    offlineStatus: '\u0911\u092B\u0932\u093E\u0907\u0928 \u0938\u094D\u0925\u093F\u0924\u093E',
    synced: '\u0938\u093F\u0902\u0915 \u0939\u094B\u0917\u093E',
    english: '\u0905\u0902\u0917\u094D\u0930\u0947\u091C\u093C\u0940',
    hindi: '\u0939\u093F\u0928\u094D\u0926\u0940',
    santali: '\u0938\u0928\u094D\u0924\u093E\u0932\u0940',
    fireExplosion: '\u0905\u0917\u094D\u0928\u093F \u0924\u0925\u093E \u0935 \u0935\u093F\u0938\u094D\u092B\u094B\u091F\u0928 \u0938\u0941\u0930\u0915\u094D\u0937\u093E',
    gasLeak: '\u0917\u0948\u0938 \u0930\u093F\u0938\u094D\u0924 \u0914\u0930 \u0938\u0902\u0915\u0941\u0937\u093F\u0924 \u0938\u094D\u092A\u0947\u0938',
    overallSafetyScore: '\u0938\u092E\u0935\u0942\u0937 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0905\u0902\u0915',
    excellent: '\u0936\u093E\u0928\u0926\u093E\u0930',
    good: '\u0905\u091A\u094D\u091B\u093E',
    needsImprovement: '\u0938\u0941\u0927\u093E\u0930 \u0906\u0935\u0936\u094D\u092F\u0915',
  },
  sat: {
    industrialSafety: '\u1B9F\u1B85\u1B9F\u1BAA\u1B95\u1B9F\u1B97\u1BBF\u1B9A \u1B89\u1BAE\u1BCD\u1BAF\u1B9F\u1B80\u1B9A \u1B9A\u1B88\u1B9F\u1B9A\u1BCD\u1BAA\u1B95\u1BCD\u1B9A\u1B97\u1BBF\u1B9A\u1B97\u1BAA\u1B99\u1BBF',
    selectLanguage: '\u1B89\u1BBE\u1B9A \u1B89\u1B9C\u1BBF\u1B9C\u1BBF\u1BA4\u1BCD\u1BA4\u1B97 \u1B9A\u1B80\u1B9B\u1BCD\u1BAA\u1B97',
    workerId: '\u1B88\u1B9B\u1B9A\u1BA3 \u1B86\u1B95\u1BCD\u1B95\u1BBF',
    name: '\u1B9A\u1B80\u1B9B\u1BCD\u1BAA\u1B97',
    industry: '\u1B9F\u1B85\u1B9F\u1BAA\u1B95\u1B9F\u1B97\u1BBF\u1B9A \u1B9A\u1B9F\u1BAF\u1BA4\u1BCD',
    continue: '\u1B9A\u1B8F\u1B9F \u1B9B\u1BB3\u1B9C\u1BCD',
    home: '\u1B9B\u1B99\u1BAA',
    training: '\u1B9A\u1B88\u1B9F\u1B9A\u1BCD\u1BAA\u1B95\u1BCD\u1B9A\u1B97\u1BAA\u1B99\u1BBF',
    certificates: '\u1B9A\u1BA4\u1B95\u1B95\u1BBE\u1BA4\u1BBF',
    profile: '\u1B89\u1B99\u1B85\u1B9A\u1BA3',
    safetyScore: '\u1B89\u1BAE\u1BCD\u1BAF\u1B9F\u1B80\u1B9A \u1B86\u1B99\u1BBF',
    trainingProgress: '\u1B9A\u1B88\u1B9F\u1B9A\u1BCD\u1BAA\u1B95\u1BCD\u1B9A\u1B97\u1BAA\u1B99\u1BBF \u1B86\u1B82\u1B95\u1BBE\u1B97\u1BBE\u1B9F\u1BBF',
    modulesCompleted: '\u1BAE\u1B95\u1BB8\u1B9A \u1B9A\u1BAE\u1BAA\u1BB0\u1BA4\u1BCD',
    pendingModules: '\u1B96\u1BAA\u1BCD\u1BAA\u1BBF\u1B95 \u1BAE\u1B95\u1BB8\u1B9A',
    continueTraining: '\u1B9A\u1B88\u1B9F\u1B9A\u1BCD\u1BAA\u1B95\u1BCD\u1B9A\u1B97\u1BAA\u1B99\u1BBF \u1B95\u1BBE\u1B9F\u1BCD \u1B9B\u1BB3\u1B9C\u1BCD',
    certificateStatus: '\u1B9A\u1BA4\u1B95\u1B95\u1BBE\u1BA4\u1BBF \u1B9F\u1B9F\u1BBE\u1B9F\u1BBF',
    earned: '\u1B89\u1BAA\u1BAA\u1BB0\u1BA4\u1BCD',
    notEarned: '\u1B95\u1BB6\u1BBF \u1B95\u1BB6\u1B85',
    startTraining: '\u1B9A\u1B88\u1B9F\u1B9A\u1BCD\u1BAA\u1B95\u1BCD\u1B9A\u1B97\u1BAA\u1B99\u1BBF \u1BAE\u1BB0\u1BBE\u1BAE\u1BCD',
    resumeTraining: '\u1B9A\u1B88\u1B9F\u1B9A\u1BCd\u1BAA\u1B95\u1BCD\u1B9A\u1B97\u1BAA\u1B99\u1BBF \u1B95\u1BBE\u1B9F\u1BCD \u1B9B\u1BB3\u1B9C\u1BCD',
    completed: '\u1B9A\u1BAE\u1BAA\u1BB0\u1BA4\u1BCD',
    scenarios: '\u1B9A\u1B88\u1B9F\u1B9A\u1BCD\u1BAA\u1B95\u1BAA\u1BCD\u1BAA\u1B85',
    difficulty: '\u1B9A\u1BBE\u1B95\u1BCD\u1B95\u1BAF\u1B97\u1BBF',
    duration: '\u1B86\u1B95\u1BA7\u1BCD\u1BAF',
    easy: '\u1BA8\u1BAA\u1B85',
    medium: '\u1BAE\u1BA7\u1BBE\u1B9C',
    hard: '\u1B9A\u1BBE\u1B95\u1BCD\u1B95\u1BAF',
    trainingObjective: '\u1B9A\u1B88\u1B9F\u1B9A\u1BCd\u1BAA\u1B95\u1BCD\u1B9A\u1B97\u1BAA\u1B99\u1BBF \u1BA4\u1BB0\u1BA3\u1BCD\u1B9F\u1BAA\u1BAA\u1BBE',
    hazardIndicator: '\u1B96\u1BB8\u1BBF\u1B9D \u1B95\u1BAF\u1B9F\u1BBE\u1B99\u1BBE\u1B95\u1BAA\u1BCD\u1BAA\u1B85',
    instructions: '\u1B9A\u1BAF\u1B89\u1BAA\u1B95\u1BCD\u1BAA\u1B85',
    tapToAct: '\u1B95\u1BA3\u1BCD\u1BAF\u1B95\u1BA3\u1BCD\u1BA4\u1B95\u1B9E\u1BBF\u1B99\u1BBF\u1BA4\u1BCD \u1B9F\u1BBF\u1BAA\u1BBF\u1BAE\u1BCD',
    high: '\u1B89\u1B9A\u1BCD\u1BA1\u1B99\u1BBF',
    medium_label: '\u1BAE\u1BA7\u1BBE\u1B9C',
    low: '\u1B9A\u1BAE\u1BAA',
    question: '\u1B9A\u1BBE\u1BAF\u1BA4\u1BCD\u1B9A',
    of: '\u1B96\u1BAA\u1B9A\u1BBF',
    selectAnswer: '\u1BA8\u1BAA\u1B85 \u1B89\u1B9F\u1BBF\u1BAA\u1B88\u1B9F \u1B9A\u1B80\u1B9B\u1BCD\u1BAA\u1B97\u1BCD',
    correct: '\u1BAE\u1BAE\u1BB0!',
    incorrect: '\u1B86\u1B9F\u1BAF\u1BBE\u1B95',
    nextQuestion: '\u1B96\u1BAA\u1B85\u1B97\u1B95',
    yourScore: '\u1B86\u1B9C\u1BCC\u1B95\u1BBE\u1B95 \u1B86\u1B99\u1BBF',
    passed: '\u1B89\u1B9F\u1BBF\u1BAA\u1B88\u1B9F',
    failed: '\u1B86\u1B9F\u1BAF\u1BBE\u1B95',
    competencyBreakdown: '\u1B95\u1BB0\u1BBF\u1B9F\u1BAA\u1BCd\u1BAA\u1BAA\u1B97\u1BBF\u1BAA\u1B97\u1BBF\u1BA4\u1BCD \u1B9A\u1B95\u1BBE\u1B95\u1BBE\u1BA4\u1BAA',
    retry: '\u1B95\u1BBE\u1B9F\u1BCD \u1B86\u1B9F\u1BA4\u1BCD\u1BAE\u1BBE\u1B97 \u1B9A\u1B88\u1B9F\u1B9A\u1BCD\u1BAA\u1B95\u1BCD\u1B9A\u1B97\u1BAA\u1B99\u1BBF',
    viewCertificate: '\u1B9A\u1BA4\u1B95\u1B95\u1BBE\u1BA4\u1BBF \u1BA4\u1B9B\u1BBF\u1BAA\u1B99\u1B95',
    certificateOfCompletion: '\u1B9A\u1BAE\u1BAA\u1BB0\u1BA4\u1BCd \u1B9A\u1BA4\u1B95\u1B95\u1BBE\u1BA4\u1BBF',
    issuedTo: '\u1B86\u1B9F\u1BA4\u1BCd \u1B89\u1BBE\u1B95\u1BB3\u1BCD',
    forCompleting: '\u1BA8\u1BAA\u1B85 \u1B9A\u1BAE\u1BAA\u1BB0\u1BA4\u1BCd \u1B9C\u1BB3\u1BCD\u1B9A\u1B97\u1BAA\u1BAA\u1BAA',
    verificationStatus: '\u1B9F\u1B85\u1B9A\u1BA4\u1BCd\u1B95\u1BAA\u1BCD\u1BAA\u1BAA\u1B85 \u1B9F\u1B9F\u1BBE\u1B9F\u1BBF',
    valid: '\u1B9C\u1B95\u1B9A',
    certificateId: '\u1B9A\u1BA4\u1B95\u1B95\u1BBE\u1BA4\u1BBF \u1B86\u1B95\u1BCD\u1B95\u1BBF',
    workerInformation: '\u1B88\u1B9B\u1B9A\u1BA3 \u1B9C\u1BBE\u1B99\u1B95\u1BA3\u1BAA\u1B85',
    completedTraining: '\u1B9A\u1BAE\u1BAA\u1BB0\u1BA4\u1BCd \u1B9A\u1B88\u1B9F\u1B9A\u1BCd\u1BAA\u1B95\u1BCd\u1B9A\u1B97\u1BAA\u1B99\u1BBF',
    language: '\u1B89\u1BBE\u1B9A',
    offlineStatus: '\u1B85\u1B9B\u1BCD\u1B9B\u1BAA\u1BCd\u1BAA\u1BAA\u1B85 \u1B9F\u1B9F\u1BBE\u1B9F\u1BBF',
    synced: '\u1B9A\u1B9F\u1B99\u1BCD\u1B95 \u1B95\u1BB6\u1BBF\u1BA4\u1BCd',
    english: '\u1B86\u1B99\u1B97\u1BCD\u1B9C\u1BBF\u1BAA\u1BBF',
    hindi: '\u1B93\u1B86\u1B96\u1BCD\u1B95\u1BCD',
    santali: '\u1B9A\u1B99\u1BCd\u1B9F\u1BBE\u1B9A\u1BBF',
    fireExplosion: '\u1B85\u1B97\u1BB8 \u1B95\u1BAA\u1BBF \u1B9A\u1B89\u1B95\u1BAA\u1BAA\u1BAA',
    gasLeak: '\u1B95\u1BBE\u1B9A \u1B9B\u1BBF\u1B9A\u1BCd\u1B9F \u1B9A\u1B9F\u1BBF\u1BAE\u1BBF \u1BA8\u1BAA\u1B85 \u1B9A\u1B8A\u1B9F\u1BA3\u1BCD\u1B9F\u1BBF\u1BAA\u1BB0\u1BAA\u1BAA\u1BAA',
    overallSafetyScore: '\u1B9A\u1B9F\u1B9C\u1BAA\u1BCd\u1BAA\u1BAA\u1B97\u1BBF\u1BA4\u1BCd \u1B89\u1BAE\u1BCd\u1BAF\u1B9F\u1B80\u1B9A \u1B86\u1B99\u1BBF',
    excellent: '\u1B9A\u1B85\u1B9D\u1BBF \u1B9A\u1BAE\u1BAA\u1BB0\u1BA4\u1BCD',
    good: '\u1BAE\u1B95\u1BCD\u1B9C\u1BB0',
    needsImprovement: '\u1B86\u1B9A\u1B95\u1BAA\u1BCD\u1BAA\u1B99\u1BBF\u1BA4\u1BCd \u1B96\u1BAA\u1BAA\u1B85',
  },
};

interface AppContextType {
  state: AppState;
  setScreen: (screen: string) => void;
  setLanguage: (lang: LanguageCode) => void;
  login: (workerId: string, name: string, industry: string) => void;
  startModule: (moduleId: string) => void;
  completeModule: (moduleId: string) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    screen: 'splash',
    language: 'en',
    worker: null,
    modules: defaultModules,
    overallScore: 72,
    certificatesEarned: 0,
    totalModules: 2,
  });

  const setScreen = useCallback((screen: string) => {
    setState(prev => ({ ...prev, screen }));
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setState(prev => ({ ...prev, language: lang }));
  }, []);

  const login = useCallback((workerId: string, name: string, industry: string) => {
    setState(prev => ({
      ...prev,
      worker: { workerId, name, industry, language: prev.language },
      screen: 'home',
    }));
  }, []);

  const startModule = useCallback((moduleId: string) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? { ...m, status: m.status === 'completed' ? 'completed' : 'in-progress' }
          : m
      ),
      screen: moduleId === 'fire' ? 'fire-ar' : 'gas-ar',
    }));
  }, []);

  const completeModule = useCallback((moduleId: string) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? { ...m, status: 'completed', progress: 100, completedScenarios: m.totalScenarios }
          : m
      ),
      overallScore: Math.min(100, prev.overallScore + 14),
      certificatesEarned: prev.certificatesEarned + 1,
      screen: 'result',
    }));
  }, []);

  const t = useCallback((key: string): string => {
    const lang = translations[state.language] || translations.en;
    return (lang as Record<string, string>)[key] || key;
  }, [state.language]);

  return (
    <AppContext.Provider value={{ state, setScreen, setLanguage, login, startModule, completeModule, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
