import axios from 'axios';
import { apiRequest } from './client';
import type {
  ApiResponse,
  FilterOption,
  GradeLookup,
  InventoryApiResponse,
  InventoryItem,
  InventoryListResponse,
  InventoryQueryParams,
  InventoryStatus,
  UnitOfMeasure,
} from '@/types';

export interface InventoryFormPayload {
  name: string;
  description?: string;
  categoryId: string;
  uomLabel: string;
  stockUnit: number;
  properties: Array<{ id?: string; label: string; type: string; value: string | number | boolean }>;
  stockIntakeProperties: Array<{ id?: string; label: string; type: string; required: boolean }>;
  tags: string[];
  notifyExpiryEnabled: boolean;
  daysBeforeExpiryNotification?: number;
  reorderOnMinStockEnabled: boolean;
  minStockReorderLevel?: number;
  notifyOnMinStockEnabled: boolean;
  minStockNotificationLevel?: number;
}

function toRequestError(err: unknown): Error {
  if (axios.isCancel(err)) {
    return new DOMException('Request aborted', 'AbortError');
  }
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data as Record<string, unknown> | undefined;
    if (status === 501) {
      return new Error('This feature is not yet available.');
    }
    const isProxyError = !err.response || (status === 500 && typeof data === 'string');
    if (isProxyError) return new Error('Please check your connection.');
    const backendMessage = (data?.message ?? data?.error ?? err.response?.statusText) as string | undefined;
    if (backendMessage) return new Error(backendMessage);
  }
  return err instanceof Error ? err : new Error('Request failed');
}

function toStatusEnum(value: unknown): InventoryStatus {
  if (typeof value !== 'string') return 'ACTIVE';
  const norm = value.trim().toLowerCase().replace(/\s+/g, '_');
  if (norm === 'intake_suspended') return 'INTAKE_SUSPENDED';
  if (norm === 'inactive') return 'INACTIVE';
  return 'ACTIVE';
}

function normalizeItem(item: InventoryItem): InventoryItem {
  const raw = item as unknown as Record<string, unknown>;
  const rawTags = Array.isArray(raw.tags) ? raw.tags : [];
  const tags: string[] = rawTags.map((t) => {
    if (typeof t === 'string') return t;
    if (typeof t === 'object' && t !== null) {
      const name = (t as Record<string, unknown>).name;
      return typeof name === 'string' ? name : '';
    }
    return '';
  });
  return {
    ...item,
    category: item.category ?? '',
    stockUnit: Number(item.stockUnit ?? 0),
    uomLabel: item.uomLabel ?? (raw.baseUnitOfMeasure as string) ?? '',
    status: toStatusEnum(item.status),
    properties: Array.isArray(item.properties) ? item.properties : [],
    stockIntakeProperties: Array.isArray(item.stockIntakeProperties) ? item.stockIntakeProperties : [],
    tags,
    grades: Array.isArray(item.grades) ? item.grades : [],
    attributes: Array.isArray(item.attributes) ? item.attributes : [],
    batchFields: Array.isArray(item.batchFields) ? item.batchFields : [],
    expiryNotificationSchedule: Array.isArray(item.expiryNotificationSchedule)
      ? item.expiryNotificationSchedule
      : [],
  };
}

function wrap<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export const inventoryApi = {
  async getItems(params: InventoryQueryParams, signal?: AbortSignal): Promise<InventoryApiResponse> {
    const query = new URLSearchParams();
    query.set('page', String(params.page - 1));
    query.set('size', String(params.pageSize));
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.status && params.status !== 'All') query.set('status', params.status);
    try {
      const res = await apiRequest<InventoryListResponse>(`/api/inventory/items?${query}`, { signal });
      const { data, pagination } = res;
      return {
        items: data.map(normalizeItem),
        total: pagination.totalItems,
        page: pagination.page,
        pageSize: pagination.limit,
      };
    } catch (err) {
      throw toRequestError(err);
    }
  },

  async getItem(id: string, signal?: AbortSignal): Promise<InventoryItem> {
    try {
      const item = await apiRequest<InventoryItem>(`/api/inventory/items/${id}`, { signal });
      return normalizeItem(item);
    } catch (err) {
      throw toRequestError(err);
    }
  },

  async createItem(payload: InventoryFormPayload): Promise<ApiResponse<InventoryItem>> {
    const created = await apiRequest<InventoryItem>('/api/inventory/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return wrap(created);
  },

  async updateItem(id: string, payload: InventoryFormPayload): Promise<ApiResponse<InventoryItem>> {
    const { name, ...rest } = payload;
    const updated = await apiRequest<InventoryItem>(`/api/inventory/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...rest, displayName: name }),
    });
    return wrap(updated);
  },

  async getCategories(signal?: AbortSignal): Promise<Array<FilterOption<string>>> {
    try {
      const list = await apiRequest<{ id: string; name: string }[]>(
        '/api/inventory/categories',
        { signal },
      );
      return list.map((c) => ({ value: c.id, label: c.name }));
    } catch (err) {
      if (axios.isCancel(err)) throw new DOMException('Request aborted', 'AbortError');
      return [];
    }
  },

  async getUnitsOfMeasure(): Promise<ApiResponse<UnitOfMeasure[]>> {
    try {
      const list = await apiRequest<Array<{ id: string; code?: string; name?: string }>>(
        '/api/inventory/units-of-measure',
      );
      return wrap(list.map((u) => ({ id: u.id, name: u.name ?? u.code ?? '' })));
    } catch {
      return { success: false, data: [] };
    }
  },

  async getGrades(): Promise<ApiResponse<GradeLookup[]>> {
    try {
      const list = await apiRequest<GradeLookup[]>('/api/inventory/grades');
      return wrap(list);
    } catch {
      return { success: false, data: [] };
    }
  },

  async getStatuses(_signal?: AbortSignal): Promise<Array<FilterOption<InventoryStatus>>> {
    return [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INTAKE_SUSPENDED', label: 'Intake Suspended' },
    ];
  },

  async suspendItem(id: string, signal?: AbortSignal): Promise<InventoryItem> {
    try {
      const item = await apiRequest<InventoryItem>(`/api/inventory/items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ allowIntake: false }),
        signal,
      });
      return normalizeItem(item);
    } catch (err) {
      throw toRequestError(err);
    }
  },

  async activateItem(id: string, signal?: AbortSignal): Promise<InventoryItem> {
    try {
      const item = await apiRequest<InventoryItem>(`/api/inventory/items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ allowIntake: true }),
        signal,
      });
      return normalizeItem(item);
    } catch (err) {
      throw toRequestError(err);
    }
  },
};
