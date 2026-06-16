import { apiRequest, getApiBaseUrl, ApiError } from '@/core/api/client';
import type { CreateStockLocationPayload, UpdateStockLocationPayload, StockLocation, StorageLocationListResponse } from '@/types';

// Evaluated lazily so Jest can import this module without import.meta.env being available.
// When VITE_API_BASE_URL points directly at the backend (e.g. http://localhost:8080),
// requests bypass the proxy so the /api prefix must be omitted.
const getBase = () =>
  getApiBaseUrl().startsWith('http')
    ? '/api/inventory/storage-locations'
    : '/api/inventory/storage-locations';

const EMPTY_LIST: StorageLocationListResponse = {
  success: true,
  data: [],
  pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
};

export const storageLocationApi = {
  async getStorageLocations(params: {
    page?: number;
    size?: number;
    search?: string;
    active?: boolean;
  } = {}): Promise<StorageLocationListResponse> {
    const q = new URLSearchParams();
    if (params.page != null) q.set('page', String(params.page));
    if (params.size != null) q.set('size', String(params.size));
    if (params.search) q.set('search', params.search);
    if (params.active !== undefined) q.set('active', String(params.active));
    const qs = q.toString();
    const url = qs ? `${getBase()}?${qs}` : getBase();
    try {
      return await apiRequest<StorageLocationListResponse>(url);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return EMPTY_LIST;
      throw err;
    }
  },

  async getStorageLocationById(id: string): Promise<StockLocation> {
    return apiRequest<StockLocation>(`${getBase()}/${id}`);
  },

  async createStorageLocation(payload: CreateStockLocationPayload): Promise<StockLocation> {
    return apiRequest<StockLocation>(getBase(), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateStorageLocation(id: string, payload: UpdateStockLocationPayload): Promise<StockLocation> {
    return apiRequest<StockLocation>(`${getBase()}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async suspendStorageLocation(id: string): Promise<StockLocation> {
    return apiRequest<StockLocation>(`${getBase()}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'SUSPEND' }),
    });
  },

  async activateStorageLocation(id: string): Promise<StockLocation> {
    return apiRequest<StockLocation>(`${getBase()}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACTIVATE' }),
    });
  },
};
