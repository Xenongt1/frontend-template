import { useCallback, useEffect, useRef, useState } from 'react';
import { listRoles } from '../api/rolesApi';
import type { RoleListResponse, RoleSummary } from '../types';

interface UseRolesState {
  items: RoleSummary[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

interface UseRolesActions {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (value: string) => void;
  reload: () => void;
}

/**
 * Browse-page state for roles. Pagination is server-driven (the mock honours
 * page + size). Search isn't wired to a UI yet (174.3) but the parameter is
 * already plumbed through so it can be flipped on in a one-line change.
 */
export function useRoles(): UseRolesState & UseRolesActions {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<RoleSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    listRoles({ page, pageSize, search })
      .then((res: RoleListResponse) => {
        if (controller.signal.aborted) return;
        setItems(res.data);
        setTotal(res.pagination.totalItems);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setError(err.message || 'Failed to load roles');
        setItems([]);
        setTotal(0);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, pageSize, search, reloadToken]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  return {
    items,
    total,
    page,
    pageSize,
    loading,
    error,
    setPage,
    setPageSize,
    setSearch: handleSearchChange,
    reload,
  };
}
