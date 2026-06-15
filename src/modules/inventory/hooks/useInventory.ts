import { useState, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { InventoryStatus } from '../types';
import { inventoryApi } from '../api/inventoryApi';

const PAGE_SIZE_OPTIONS = [10, 20];

export const useInventory = () => {
  // ── URL search params (typed by the catalogue route's validateSearch) ────────
  const search = useSearch({ from: '/inventory/catalogue' });
  const navigate = useNavigate({ from: '/inventory/catalogue' });
  const queryClient = useQueryClient();

  const urlSearch = search.q ?? '';
  const urlCategory = search.category ?? 'All';
  const urlStatus = (search.status ?? 'All') as InventoryStatus | 'All';
  const urlPage = search.page ?? 1;
  const urlPageSize = PAGE_SIZE_OPTIONS.includes(search.pageSize ?? 10)
    ? (search.pageSize ?? 10)
    : 10;

  // ── Local state for the visible search input (stays snappy on keystroke) ─────
  const [inputSearch, setInputSearch] = useState(urlSearch);

  useEffect(() => {
    setInputSearch(urlSearch);
  }, [urlSearch]);

  // Debounce: write inputSearch → URL after 300 ms of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = inputSearch.trim();
      if ((search.q ?? '') === trimmed) return;
      navigate({
        search: (prev) => ({
          ...prev,
          q: trimmed || undefined,
          page: 1,
        }),
        replace: true,
      });
    }, 300);
    return () => clearTimeout(timer);
  // biome-ignore lint/correctness/useExhaustiveDependencies: inputSearch drives the debounce
  }, [inputSearch]);

  // ── TanStack Query for data fetching ─────────────────────────────────────────
  const queryKey = ['inventory', { q: urlSearch, category: urlCategory, status: urlStatus, page: urlPage, pageSize: urlPageSize }] as const;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      inventoryApi.getItems(
        {
          page: urlPage,
          pageSize: urlPageSize,
          search: urlSearch || undefined,
          category: urlCategory !== 'All' ? urlCategory : undefined,
          status: urlStatus !== 'All' ? urlStatus : undefined,
        },
        signal,
      ),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / urlPageSize));

  const reload = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
  };

  // ── URL navigation helpers ────────────────────────────────────────────────────

  const updateSearch = (value: string) => setInputSearch(value);

  const updateCategory = (category: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        category: category !== 'All' ? category : undefined,
        page: 1,
      }),
      replace: true,
    });
  };

  const updateStatus = (status: InventoryStatus | 'All') => {
    navigate({
      search: (prev) => ({
        ...prev,
        status: status !== 'All' ? status : undefined,
        page: 1,
      }),
      replace: true,
    });
  };

  const applyFilters = (status: InventoryStatus | 'All', category: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        status: status !== 'All' ? status : undefined,
        category: category !== 'All' ? category : undefined,
        page: 1,
      }),
      replace: true,
    });
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      navigate({ search: (prev) => ({ ...prev, page }) });
    }
  };

  const changePageSize = (pageSize: number) => {
    navigate({
      search: (prev) => ({ ...prev, pageSize, page: 1 }),
      replace: true,
    });
  };

  return {
    items,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    filters: {
      search: inputSearch,
      category: urlCategory,
      status: urlStatus,
    },
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
    refetch,
  };
};
