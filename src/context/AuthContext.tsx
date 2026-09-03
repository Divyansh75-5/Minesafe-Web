import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  type User,
} from 'firebase/auth';
import {
  getAuthInstance,
  initFirebase,
  isFirebaseConfigured,
} from '../services/firebase/config';
import { getUserProfile, createUserProfile } from '../services/api/users';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
}

const demoAdminProfile = {
  uid: 'demo-admin',
  email: 'admin@minesafe.in',
  displayName: 'Demo Admin',
  role: 'admin',
  language: 'en',
  region: 'Jharkhand',
  isActive: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemo = !isFirebaseConfigured();

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      // Demo mode: present a demo admin so the dashboard is fully usable offline-of-Firebase.
      setProfile(demoAdminProfile);
      setLoading(false);
      return;
    }

    initFirebase();
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, async (current) => {
      setUser(current);
      if (current) {
        const p = await getUserProfile(current.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured()) {
      if (email?.toLowerCase() === 'admin@minesafe.in') {
        setProfile(demoAdminProfile);
        return;
      }
      throw new Error('Demo login: use admin@minesafe.in');
    }
    await signInWithEmailAndPassword(getAuthInstance(), email, password);
  };

  const register = async (
    email: string,
    password: string,
    data: Record<string, unknown>
  ) => {
    if (!isFirebaseConfigured()) return;
    const cred = await createUserWithEmailAndPassword(
      getAuthInstance(),
      email,
      password
    );
    await createUserProfile(cred.user.uid, {
      uid: cred.user.uid,
      email,
      ...data,
    });
  };

  const logout = async () => {
    if (!isFirebaseConfigured()) {
      setProfile(null);
      setUser(null);
      return;
    }
    await signOut(getAuthInstance());
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, register, logout, isDemo }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
