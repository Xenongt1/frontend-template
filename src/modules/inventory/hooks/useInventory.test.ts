import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../api/inventoryApi', () => ({
  inventoryApi: {
    getItems: jest.fn(),
  },
}));
jest.mock('@/core/api/client', () => ({}));

import { inventoryApi } from '../api/inventoryApi';

const mockGetItems = inventoryApi.getItems as jest.MockedFunction<typeof inventoryApi.getItems>;

const emptyPage = { items: [], total: 0, page: 1, pageSize: 10 };

// ─── Wrapper factories ────────────────────────────────────────────────────────

function makeWrapper(initialUrl = '/') {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(MemoryRouter, { initialEntries: [initialUrl] }, children);
  };
}

import { useInventory } from './useInventory';

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.useRealTimers();
  mockGetItems.mockReset();
  mockGetItems.mockResolvedValue(emptyPage);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useInventory — URL state', () => {
  // ── Initial state from URL ─────────────────────────────────────────────────

  it('reads search, category, status from URL on mount', async () => {
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/?search=timber&category=cat-1&status=ACTIVE'),
    });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());

    expect(result.current.filters.search).toBe('timber');
    expect(result.current.filters.category).toBe('cat-1');
    expect(result.current.filters.status).toBe('ACTIVE');
  });

  it('reads page and pageSize from URL on mount', async () => {
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/?page=3&pageSize=20'),
    });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());

    expect(result.current.pagination.page).toBe(3);
    expect(result.current.pagination.pageSize).toBe(20);
  });

  it('defaults to page 1, pageSize 10 when no URL params', async () => {
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/'),
    });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());

    expect(result.current.pagination.page).toBe(1);
    expect(result.current.pagination.pageSize).toBe(10);
  });

  it('rejects invalid pageSize and falls back to 10', async () => {
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/?pageSize=999'),
    });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());

    expect(result.current.pagination.pageSize).toBe(10);
  });

  // ── Search debounce ────────────────────────────────────────────────────────

  it('updates filters.search immediately when updateSearch is called', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/'),
    });

    act(() => { result.current.updateSearch('timber'); });

    expect(result.current.filters.search).toBe('timber');

    jest.useRealTimers();
  });

  it('does not fire a new fetch until 300 ms after typing stops', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/'),
    });

    await act(async () => { jest.runAllTimers(); });
    mockGetItems.mockClear();

    act(() => { result.current.updateSearch('t'); });
    expect(mockGetItems).not.toHaveBeenCalled();

    await act(async () => { jest.advanceTimersByTime(300); });
    expect(mockGetItems).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('passes the debounced search value to getItems', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/'),
    });

    await act(async () => { jest.runAllTimers(); });
    mockGetItems.mockClear();

    act(() => { result.current.updateSearch('timber'); });
    await act(async () => { jest.advanceTimersByTime(300); });

    const callArgs = mockGetItems.mock.calls[0][0];
    expect(callArgs.search).toBe('timber');

    jest.useRealTimers();
  });

  // ── Category and status updates ────────────────────────────────────────────

  it('updateCategory triggers a new fetch with the updated category', async () => {
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/'),
    });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());
    mockGetItems.mockClear();

    act(() => { result.current.updateCategory('cat-1'); });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());
    expect(mockGetItems.mock.calls[0][0].category).toBe('cat-1');
  });

  it('updateStatus triggers a new fetch with the updated status', async () => {
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/'),
    });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());
    mockGetItems.mockClear();

    act(() => { result.current.updateStatus('ACTIVE'); });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());
    expect(mockGetItems.mock.calls[0][0].status).toBe('ACTIVE');
  });

  it('updateCategory resets pagination to page 1', async () => {
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/?page=3'),
    });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());

    act(() => { result.current.updateCategory('cat-1'); });

    await waitFor(() => expect(result.current.pagination.page).toBe(1));
  });

  // ── Page navigation ────────────────────────────────────────────────────────

  it('goToPage updates the page in URL and triggers a fetch', async () => {
    mockGetItems.mockResolvedValue({ items: [], total: 100, page: 1, pageSize: 10 });
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/'),
    });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());
    mockGetItems.mockClear();

    act(() => { result.current.goToPage(2); });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());
    expect(mockGetItems.mock.calls[0][0].page).toBe(2);
    expect(result.current.pagination.page).toBe(2);
  });

  it('goToPage ignores invalid page numbers', async () => {
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/'),
    });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());
    mockGetItems.mockClear();

    act(() => { result.current.goToPage(0); });
    act(() => { result.current.goToPage(-1); });

    expect(mockGetItems).not.toHaveBeenCalled();
    expect(result.current.pagination.page).toBe(1);
  });

  // ── changePageSize ─────────────────────────────────────────────────────────

  it('changePageSize updates pageSize and resets to page 1', async () => {
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/?page=3'),
    });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());

    act(() => { result.current.changePageSize(20); });

    await waitFor(() => {
      expect(result.current.pagination.pageSize).toBe(20);
      expect(result.current.pagination.page).toBe(1);
    });
  });

  // ── reload ─────────────────────────────────────────────────────────────────

  it('reload triggers a new fetch without changing URL params', async () => {
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/?search=timber'),
    });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());
    mockGetItems.mockClear();

    act(() => { result.current.reload(); });

    await waitFor(() => expect(mockGetItems).toHaveBeenCalled());
    expect(result.current.filters.search).toBe('timber');
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  it('sets error state when getItems rejects', async () => {
    mockGetItems.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/'),
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });
  });

  // ── totalPages ─────────────────────────────────────────────────────────────

  it('calculates totalPages correctly from total and pageSize', async () => {
    mockGetItems.mockResolvedValue({ items: [], total: 45, page: 1, pageSize: 10 });

    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/'),
    });

    await waitFor(() => expect(result.current.totalPages).toBe(5));
  });

  it('returns totalPages of at least 1 even when total is 0', async () => {
    const { result } = renderHook(() => useInventory(), {
      wrapper: makeWrapper('/'),
    });

    await waitFor(() => expect(result.current.totalPages).toBe(1));
  });
});
