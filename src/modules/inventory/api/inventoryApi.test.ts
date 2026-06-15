jest.mock('axios');
jest.mock('@/core/api/client', () => ({
  apiRequest: jest.fn(),
}));

import axios from 'axios';
import { apiRequest } from '@/core/api/client';
import { inventoryApi } from './inventoryApi';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => {
  jest.clearAllMocks();
  (mockedAxios.isCancel as unknown as jest.Mock) = jest.fn(() => false);
  (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn(() => false);
});

/* ─── getItems ──────────────────────────────────────────────────────────────── */

describe('inventoryApi.getItems', () => {
  const basePagination = { page: 1, limit: 10, totalItems: 1, totalPages: 1 };
  const baseItem = {
    id: 'i1',
    sku: 'A',
    displayName: 'Foo',
    description: '',
    category: 'RAW_MATERIAL',
    baseUnitOfMeasure: 'KG',
    status: 'ACTIVE',
    grades: null,
    attributes: null,
    batchFields: null,
    tags: null,
    expiryNotificationSchedule: null,
  };

  it('builds 0-based page, size, search, category, status (skipping All)', async () => {
    mockApiRequest.mockResolvedValueOnce({ data: [baseItem], pagination: basePagination });

    await inventoryApi.getItems({
      page: 3,
      pageSize: 25,
      search: 'wood',
      category: 'RAW_MATERIAL',
      status: 'ACTIVE',
    });

    const url = mockApiRequest.mock.calls[0][0] as string;
    expect(url).toContain('page=2'); // 3 - 1
    expect(url).toContain('size=25');
    expect(url).toContain('search=wood');
    expect(url).toContain('category=RAW_MATERIAL');
    expect(url).toContain('status=ACTIVE');
  });

  it('omits search/category/status when absent or set to "All"', async () => {
    mockApiRequest.mockResolvedValueOnce({ data: [], pagination: basePagination });

    await inventoryApi.getItems({ page: 1, pageSize: 10, category: 'All', status: 'All' });

    const url = mockApiRequest.mock.calls[0][0] as string;
    expect(url).not.toContain('search=');
    expect(url).not.toContain('category=');
    expect(url).not.toContain('status=');
  });

  it('normalises null array fields to []', async () => {
    mockApiRequest.mockResolvedValueOnce({ data: [baseItem], pagination: basePagination });

    const res = await inventoryApi.getItems({ page: 1, pageSize: 10 });
    expect(res.items[0]).toMatchObject({
      grades: [],
      attributes: [],
      batchFields: [],
      tags: [],
      expiryNotificationSchedule: [],
    });
    expect(res.total).toBe(1);
    expect(res.page).toBe(1);
    expect(res.pageSize).toBe(10);
  });

  it('throws a normalised error when the request fails', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Please check your connection.'));

    await expect(
      inventoryApi.getItems({ page: 1, pageSize: 10 })
    ).rejects.toThrow(/check your connection/i);
  });
});

/* ─── getItem ───────────────────────────────────────────────────────────────── */

describe('inventoryApi.getItem', () => {
  const baseItem = {
    id: 'i1',
    sku: 'A',
    displayName: 'Foo',
    category: 'RAW_MATERIAL',
    baseUnitOfMeasure: 'KG',
    status: 'ACTIVE',
    grades: null,
    attributes: null,
    batchFields: null,
    tags: null,
    expiryNotificationSchedule: null,
  };

  it('GETs by id and normalises null arrays', async () => {
    mockApiRequest.mockResolvedValueOnce(baseItem);

    const item = await inventoryApi.getItem('i1');
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining('/inventory/items/i1'),
      expect.any(Object)
    );
    expect(item.grades).toEqual([]);
    expect(item.attributes).toEqual([]);
  });

  it('propagates errors thrown by apiRequest', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Bad item id'));
    await expect(inventoryApi.getItem('bad')).rejects.toThrow('Bad item id');
  });

  it('returns AbortError when the request was cancelled', async () => {
    const cancelMarker = new Error('cancel');
    (mockedAxios.isCancel as unknown as jest.Mock).mockImplementation(
      (e: unknown) => e === cancelMarker
    );
    mockApiRequest.mockRejectedValueOnce(cancelMarker);

    await expect(inventoryApi.getItem('x')).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('re-wraps non-Error rejections as a generic Error', async () => {
    mockApiRequest.mockRejectedValueOnce('a raw string');
    await expect(inventoryApi.getItem('x')).rejects.toThrow('Request failed');
  });
});

/* ─── getCategories ─────────────────────────────────────────────────────────── */

describe('inventoryApi.getCategories', () => {
  it('maps the API response to FilterOption shape', async () => {
    mockApiRequest.mockResolvedValueOnce([
      { id: 'cat-1', name: 'Raw Materials' },
      { id: 'cat-2', name: 'Consumables' },
    ]);

    const out = await inventoryApi.getCategories();
    expect(out).toEqual([
      { value: 'cat-1', label: 'Raw Materials' },
      { value: 'cat-2', label: 'Consumables' },
    ]);
  });

  it('returns an empty array on any non-cancel error', async () => {
    mockApiRequest.mockRejectedValue(new Error('endpoint missing'));
    await expect(inventoryApi.getCategories()).resolves.toEqual([]);
  });

  it('propagates cancellation as AbortError', async () => {
    const cancelMarker = new Error('cancel');
    (mockedAxios.isCancel as unknown as jest.Mock).mockImplementation(
      (e: unknown) => e === cancelMarker
    );
    mockApiRequest.mockRejectedValueOnce(cancelMarker);
    await expect(inventoryApi.getCategories()).rejects.toMatchObject({ name: 'AbortError' });
  });
});

/* ─── getStatuses ────────────────────────────────────────────────────────────── */

describe('inventoryApi.getStatuses', () => {
  it('returns the static ACTIVE + INTAKE_SUSPENDED options', async () => {
    const out = await inventoryApi.getStatuses();
    expect(out).toEqual([
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INTAKE_SUSPENDED', label: 'Intake Suspended' },
    ]);
    expect(mockApiRequest).not.toHaveBeenCalled();
  });
});

/* ─── suspendItem / activateItem ─────────────────────────────────────────────── */

describe('suspendItem and activateItem', () => {
  const baseItem = {
    id: 'i1',
    sku: 'A',
    displayName: 'Foo',
    category: 'RAW_MATERIAL',
    baseUnitOfMeasure: 'KG',
    status: 'INTAKE_SUSPENDED',
    grades: null,
    attributes: null,
    batchFields: null,
    tags: null,
    expiryNotificationSchedule: null,
  };

  it('suspendItem calls apiRequest with allowIntake:false and normalises arrays', async () => {
    mockApiRequest.mockResolvedValueOnce(baseItem);

    const item = await inventoryApi.suspendItem('i1');
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining('/inventory/items/i1'),
      expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('"allowIntake":false') })
    );
    expect(item.grades).toEqual([]);
  });

  it('activateItem calls apiRequest with allowIntake:true', async () => {
    mockApiRequest.mockResolvedValueOnce({ ...baseItem, status: 'Active' });

    const item = await inventoryApi.activateItem('i1');
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining('/inventory/items/i1'),
      expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('"allowIntake":true') })
    );
    expect(item.status).toBe('ACTIVE');
  });

  it('suspend errors are surfaced', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Cannot suspend'));
    await expect(inventoryApi.suspendItem('i1')).rejects.toThrow('Cannot suspend');
  });

  it('activate errors are surfaced', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Cannot activate'));
    await expect(inventoryApi.activateItem('i1')).rejects.toThrow('Cannot activate');
  });
});
