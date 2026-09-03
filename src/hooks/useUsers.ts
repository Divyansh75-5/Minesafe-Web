import { useEffect, useState } from 'react';
import { getAllUsers } from '../services/api/users';
import type { UserProfile } from '../types/models';

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getAllUsers();
        if (!cancelled) setUsers(data);
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { users, loading };
}