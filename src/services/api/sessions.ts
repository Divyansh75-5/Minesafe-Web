import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  type QueryConstraint,
} from 'firebase/firestore';
import { getDbInstance, isFirebaseConfigured } from '../firebase/config';
import { demoSessions } from '../demoData';
import type { TrainingSession } from '../../types/models';

const COLLECTION = 'trainingSessions';

export async function getSessions(
  filters?: { userId?: string; moduleId?: string }
): Promise<TrainingSession[]> {
  let list: TrainingSession[];
  if (isFirebaseConfigured()) {
    const db = getDbInstance();
    const constraints: QueryConstraint[] = [];

    if (filters?.userId) {
      constraints.push(where('userId', '==', filters.userId));
    }

    if (filters?.moduleId) {
      constraints.push(where('moduleId', '==', filters.moduleId));
    }

    constraints.push(orderBy('startedAt', 'desc'));

    const q = query(collection(db, COLLECTION), ...constraints);
    const snap = await getDocs(q);
    list = snap.docs.map((d) => d.data() as TrainingSession);
  } else {
    list = demoSessions.slice();
  }

  if (filters?.userId) list = list.filter((s) => s.userId === filters.userId);
  if (filters?.moduleId) list = list.filter((s) => s.moduleId === filters.moduleId);
  return list.sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt));
}

export async function getSessionStats(userId: string) {
  const all = await getSessions({ userId });
  const completed = all.filter((s) => s.status === 'completed');
  const passed = completed.filter((s) => s.passed).length;
  return {
    completed: completed.length,
    passed,
    passRate: completed.length > 0 ? (passed / completed.length) * 100 : 0,
  };
}