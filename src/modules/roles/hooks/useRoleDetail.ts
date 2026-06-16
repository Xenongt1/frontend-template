import { useCallback, useEffect, useState } from 'react';
import { getRoleById } from '../api/rolesApi';
import type { RoleDetail } from '../types';

interface UseRoleDetailState {
  data: RoleDetail | null;
  loading: boolean;
  error: string | null;
}

interface UseRoleDetailActions {
  reload: () => void;
}

export function useRoleDetail(id: string | undefined): UseRoleDetailState & UseRoleDetailActions {
  const [data, setData] = useState<RoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!id) {
      setError('Missing role id');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    getRoleById(id)
      .then((res) => {
        if (cancelled) return;
        setData(res);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load role');
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id, reloadToken]);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  return { data, loading, error, reload };
}
