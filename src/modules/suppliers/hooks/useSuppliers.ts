import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supplierApi } from '@/core/api';
import type { SupplierStatus } from '@/core/api';

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const useSuppliers = () => {
  const navigate = useNavigate();
  const rawSearch = useRouterState({ select: s => s.location.searchStr });

  const setSearchParams = (
    updater: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
    options?: { replace?: boolean },
  ) => {
    const current = new URLSearchParams(rawSearch);
    const next = typeof updater === 'function' ? updater(current) : updater;
    (navigate as any)({
      search: () => Object.fromEntries(next.entries()),
      replace: options?.replace ?? false,
    });
  };

  // ── Read URL ───────────────────────────────────────────────────────────────
  const searchParams = new URLSearchParams(rawSearch);

  const urlSearch   = searchParams.get('q') ?? '';
  const urlStatus   = (searchParams.get('status') ?? '') as SupplierStatus | '';
  const urlMaterials = useMemo(() => {
    const raw = searchParams.get('materials');
    return raw ? raw.split(',').filter(Boolean) : [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('materials')]);
  const urlPage     = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const urlPageSize = PAGE_SIZE_OPTIONS.includes(Number(searchParams.get('pageSize')))
    ? Number(searchParams.get('pageSize'))
    : 10;

  // ── Local search input (debounced to URL) ──────────────────────────────────
  const [inputSearch, setInputSearch] = useState(urlSearch);

  useEffect(() => { setInputSearch(urlSearch); }, [urlSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(
        prev => {
          const trimmed = inputSearch.trim();
          if ((prev.get('q') ?? '') === trimmed) return prev;
          const next = new URLSearchParams(prev);
          trimmed ? next.set('q', trimmed) : next.delete('q');
          next.set('page', '1');
          return next;
        },
        { replace: true },
      );
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSearch]);

  // ── Main query (filtered + paginated) ─────────────────────────────────────
  const queryKey = [
    'suppliers',
    { q: urlSearch, status: urlStatus, materials: urlMaterials.join(','), page: urlPage, pageSize: urlPageSize },
  ];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      supplierApi.getSuppliers({
        search:      urlSearch || undefined,
        status:      urlStatus || undefined,
        materialIds: urlMaterials.length ? urlMaterials : undefined,
        page:        urlPage,
        pageSize:    urlPageSize,
      }),
  });

  // ── Materials options query (unfiltered, for the dropdown) ─────────────────
  // Fetches with a large page to collect all unique approved items.
  const { data: materialsData } = useQuery({
    queryKey: ['suppliers-materials-options'],
    queryFn: () => supplierApi.getSuppliers({ pageSize: 1000 }),
    staleTime: 5 * 60 * 1000,
  });

  const allMaterials = useMemo(() => {
    const seen = new Set<string>();
    const items: { id: string; name: string }[] = [];
    (materialsData?.data?.suppliers ?? []).forEach(s => {
      s.approvedItems.forEach(item => {
        if (!seen.has(item.inventoryItemId)) {
          seen.add(item.inventoryItemId);
          items.push({ id: item.inventoryItemId, name: item.name });
        }
      });
    });
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [materialsData]);

  const suppliers  = data?.data?.suppliers ?? [];
  const total      = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / urlPageSize));
  const errorMsg   = error ? (error as Error).message : '';

  // ── Update functions (all write to URL) ────────────────────────────────────

  const updateSearch = (s: string) => setInputSearch(s);

  const updateStatus = (status: SupplierStatus | '') => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      status ? next.set('status', status) : next.delete('status');
      next.set('page', '1');
      return next;
    }, { replace: true });
  };

  const toggleMaterial = (id: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      const current = (prev.get('materials') ?? '').split(',').filter(Boolean);
      const updated = current.includes(id)
        ? current.filter(m => m !== id)
        : [...current, id];
      updated.length ? next.set('materials', updated.join(',')) : next.delete('materials');
      next.set('page', '1');
      return next;
    }, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('status');
      next.delete('materials');
      next.set('page', '1');
      return next;
    }, { replace: true });
  };

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('page', String(p));
        return next;
      });
    }
  };

  const changePageSize = (size: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('pageSize', String(size));
      next.set('page', '1');
      return next;
    }, { replace: true });
  };

  return {
    suppliers,
    loading: isLoading,
    error: errorMsg,
    total,
    allMaterials,
    filters: {
      search:    inputSearch,
      status:    urlStatus,
      materials: urlMaterials,
    },
    pagination:       { page: urlPage, pageSize: urlPageSize, total },
    totalPages,
    pageSizeOptions:  PAGE_SIZE_OPTIONS,
    updateSearch,
    updateStatus,
    toggleMaterial,
    clearFilters,
    goToPage,
    changePageSize,
    reload: () => refetch(),
  };
};
