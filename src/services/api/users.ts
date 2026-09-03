import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { getDbInstance, isFirebaseConfigured } from '../firebase/config';
import { demoUsers } from '../demoData';
import type { UserProfile } from '../../types/models';

const COLLECTION = 'users';

export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  if (!isFirebaseConfigured()) return;
  const db = getDbInstance();
  await setDoc(doc(db, COLLECTION, uid), {
    ...data,
    isActive: true,
    role: 'worker',
    createdAt: new Date(),
    lastLoginAt: new Date(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured()) {
    return demoUsers.find((u) => u.uid === uid) ?? null;
  }
  const db = getDbInstance();
  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function getAllUsers(): Promise<UserProfile[]> {
  if (!isFirebaseConfigured()) {
    return demoUsers.filter((u) => u.role !== 'admin');
  }
  const db = getDbInstance();
  const q = query(collection(db, COLLECTION), where('role', '!=', 'admin'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserProfile);
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  if (!isFirebaseConfigured()) return;
  const db = getDbInstance();
  await updateDoc(doc(db, COLLECTION, uid), data);
}

export async function deleteUserProfile(uid: string) {
  if (!isFirebaseConfigured()) return;
  const db = getDbInstance();
  await deleteDoc(doc(db, COLLECTION, uid));
}

export async function deactivateUser(uid: string) {
  if (!isFirebaseConfigured()) return;
  const db = getDbInstance();
  await updateDoc(doc(db, COLLECTION, uid), { isActive: false });
}

export async function activateUser(uid: string) {
  if (!isFirebaseConfigured()) return;
  const db = getDbInstance();
  await updateDoc(doc(db, COLLECTION, uid), { isActive: true });
}
