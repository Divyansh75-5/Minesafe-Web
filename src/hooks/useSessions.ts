import { useEffect, useState } from 'react';
import { getSessions } from '../services/api/sessions';
import type { TrainingSession } from '../types/models';

export function useSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getSessions();
        if (!cancelled) setSessions(data);
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

  return { sessions, loading };
}