import { renderHook, act, waitFor } from '@testing-library/react';

jest.mock('../api/rolesApi', () => ({
  listRoles: jest.fn(),
}));
jest.mock('@/core/api/client', () => ({}));

import { listRoles } from '../api/rolesApi';
import { useRoles } from './useRoles';

const mockedListRoles = listRoles as jest.MockedFunction<typeof listRoles>;

const emptyResponse = {
  data: [],
  pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
};

beforeEach(() => {
  mockedListRoles.mockReset();
});

describe('useRoles', () => {
  it('loads roles on mount and exposes loading → items', async () => {
    mockedListRoles.mockResolvedValueOnce({
      data: [
        {
          id: 'r1',
          name: 'Admin',
          description: '',
          memberCount: 3,
          previewMembers: [],
          permissionCount: 5,
          isSystem: false,
        },
      ],
      pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
    });

    const { result } = renderHook(() => useRoles());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.total).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('captures error.message when listRoles rejects', async () => {
    mockedListRoles.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useRoles());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('boom');
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('falls back to a generic error message when the rejection has no message', async () => {
    mockedListRoles.mockRejectedValueOnce(new Error(''));
    const { result } = renderHook(() => useRoles());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to load roles');
  });

  it('setSearch resets page back to 1', async () => {
    mockedListRoles.mockResolvedValue(emptyResponse);
    const { result } = renderHook(() => useRoles());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(5));
    await waitFor(() => expect(result.current.page).toBe(5));

    act(() => result.current.setSearch('admin'));
    await waitFor(() => expect(result.current.page).toBe(1));
  });

  it('reload re-triggers listRoles', async () => {
    mockedListRoles.mockResolvedValue(emptyResponse);
    const { result } = renderHook(() => useRoles());
    await waitFor(() => expect(mockedListRoles).toHaveBeenCalledTimes(1));

    act(() => result.current.reload());
    await waitFor(() => expect(mockedListRoles).toHaveBeenCalledTimes(2));
  });

  it('setPageSize triggers a refetch with the new size', async () => {
    mockedListRoles.mockResolvedValue(emptyResponse);
    const { result } = renderHook(() => useRoles());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPageSize(25));
    await waitFor(() => expect(result.current.pageSize).toBe(25));
    expect(mockedListRoles).toHaveBeenLastCalledWith(
      expect.objectContaining({ pageSize: 25 }),
    );
  });
});
