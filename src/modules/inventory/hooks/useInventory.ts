import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { liteDebounce } from '@tanstack/pacer-lite';
import type { InventoryItem, InventoryFilters, InventoryStatus } from '../types';
import { inventoryApi } from '../api/inventoryApi';

const PAGE_SIZE_OPTIONS = [10, 20];

export const useInventory = () => {
  const navigate = useNavigate();
  const rawSearch = useRouterState({ select: (s) => s.location.searchStr });
  const searchParams = new URLSearchParams(rawSearch);

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

  // ── Read all filter/pagination state from the URL ──────────────────────────
  const urlSearch   = searchParams.get('search')   ?? '';
  const urlCategory = searchParams.get('category') ?? 'All';
  const urlStatus   = (searchParams.get('status')  ?? 'All') as InventoryStatus | 'All';
  const urlPage     = Math.max(1, Number(searchParams.get('page')     ?? '1'));
  const urlPageSize = PAGE_SIZE_OPTIONS.includes(Number(searchParams.get('pageSize')))
    ? Number(searchParams.get('pageSize'))
    : 10;

  // ── Local state for the visible search input ───────────────────────────────
  // Keeps the input responsive on every keystroke while the URL lags by 300 ms.
  const [inputSearch, setInputSearch] = useState(urlSearch);

  // Sync input when the URL changes externally (browser back / forward).
  useEffect(() => {
    setInputSearch(urlSearch);
  }, [urlSearch]);

  // Hold the latest URL-write closure in a ref so the debouncer (created once)
  // always sees the current rawSearch when it fires.
  const writeSearchToUrlRef = useRef<(search: string) => void>(() => {});
  writeSearchToUrlRef.current = (search: string) => {
    setSearchParams(
      (prev) => {
        const trimmed = search.trim();
        if ((prev.get('search') ?? '') === trimmed) return prev;
        const next = new URLSearchParams(prev);
        trimmed ? next.set('search', trimmed) : next.delete('search');
        next.set('page', '1');
        return next;
      },
      { replace: true },
    );
  };

  // 300ms trailing-edge debounce on search→URL writes via @tanstack/pacer-lite.
  const debouncedWriteSearch = useMemo(
    () => liteDebounce((s: string) => writeSearchToUrlRef.current(s), { wait: 300 }),
    [],
  );

  // ── API state ──────────────────────────────────────────────────────────────
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const reload = () => setReloadTick((t) => t + 1);

  // Fetch whenever any URL-driven value changes (search is already debounced).
  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await inventoryApi.getItems(
          {
            page: urlPage,
            pageSize: urlPageSize,
            search: urlSearch || undefined,
            category: urlCategory,
            status: urlStatus,
          },
          controller.signal,
        );
        setItems(data.items);
        setTotal(data.total);
      } catch (err) {
        const e = err as Error;
        if (e.name === 'AbortError' || controller.signal.aborted) return;
        console.error('Error fetching inventory:', e);
        setError(e.message || 'Failed to load inventory');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [urlSearch, urlCategory, urlStatus, urlPage, urlPageSize, reloadTick]);

  const totalPages = Math.max(1, Math.ceil(total / urlPageSize));

  // ── Update functions ───────────────────────────────────────────────────────

  // Search: update local state immediately; the pacer-lite debouncer writes to URL.
  const updateSearch = (search: string) => {
    setInputSearch(search);
    debouncedWriteSearch(search);
  };

  // Category / status: write straight to URL, reset to page 1.
  const updateCategory = (category: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        category !== 'All' ? next.set('category', category) : next.delete('category');
        next.set('page', '1');
        return next;
      },
      { replace: true },
    );
  };

  const updateStatus = (status: InventoryStatus | 'All') => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        status !== 'All' ? next.set('status', status) : next.delete('status');
        next.set('page', '1');
        return next;
      },
      { replace: true },
    );
  };

  const applyFilters = (status: InventoryStatus | 'All', category: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        status !== 'All' ? next.set('status', status) : next.delete('status');
        category !== 'All' ? next.set('category', category) : next.delete('category');
        next.set('page', '1');
        return next;
      },
      { replace: true },
    );
  };

  // Page navigation: push so the back button restores the previous page.
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(page));
        return next;
      });
    }
  };

  // Page-size change: replace (preference change, not navigation).
  const changePageSize = (pageSize: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('pageSize', String(pageSize));
        next.set('page', '1');
        return next;
      },
      { replace: true },
    );
  };

  // ── Return same shape as before — no breaking changes ─────────────────────
  const filters: InventoryFilters = {
    search: inputSearch,   // local state → input stays snappy
    category: urlCategory,
    status: urlStatus,
  };

  return {
    items,
    loading,
    error,
    filters,
    pagination: { page: urlPage, pageSize: urlPageSize, total },
    totalPages,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    updateSearch,
    updateCategory,
    updateStatus,
    applyFilters,
    goToPage,
    changePageSize,
    reload,
  };
};
