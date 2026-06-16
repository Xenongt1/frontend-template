import { apiRequest } from '@/core/api/client';
import type { ApiResponse } from '@/types';

export type SupplierStatus = 'ACTIVE' | 'SUSPENDED';

export interface ApprovedItem {
  inventoryItemId: string;
  name: string;
  unitOfMeasureLabel?: string | null;
}

export interface Supplier {
  id: string;
  fullName: string;
  companyName?: string;
  phoneCountryCode?: string;
  phoneNumber: string;
  email: string;
  notes?: string;
  status?: SupplierStatus;
  approvedItems: ApprovedItem[];
  approvedInventoryItemIds: string[];
  deliveryUnitIds: string[];
  createdAt?: string;
}

export interface SupplierQueryParams {
  search?: string;
  status?: SupplierStatus;
  materialIds?: string[];
  page?: number;      // 1-based (converted to 0-based for Spring backend)
  pageSize?: number;
}

export interface SupplierListResponse {
  suppliers: Supplier[];
  total: number;
}

export interface CreateSupplierPayload {
  contactPerson: string;
  companyName?: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email: string;
  notes?: string;
  approvedInventoryItemIds: string[];
  deliveryUnitIds: string[];
}

export type UpdateSupplierPayload = Partial<CreateSupplierPayload>;

interface RawSupplier {
  id: string;
  contactPerson: string;
  companyName?: string;
  phoneCountryCode?: string;
  phoneNumber: string;
  email: string;
  notes?: string | null;
  active: boolean;
  approvedItems: ApprovedItem[];
  createdAt?: string;
}

interface PagedResponse<T> {
  content: T[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
}

function normalizeSupplier(raw: RawSupplier): Supplier {
  return {
    id: raw.id,
    fullName: raw.contactPerson,
    companyName: raw.companyName,
    phoneCountryCode: raw.phoneCountryCode,
    phoneNumber: raw.phoneNumber,
    email: raw.email,
    notes: raw.notes ?? undefined,
    status: raw.active ? 'ACTIVE' : 'SUSPENDED',
    approvedItems: raw.approvedItems ?? [],
    approvedInventoryItemIds: (raw.approvedItems ?? []).map(i => i.inventoryItemId),
    deliveryUnitIds: [],
    createdAt: raw.createdAt,
  };
}

function toRequestError(err: unknown): Error {
  if (err instanceof Error) return err;
  return new Error('Request failed');
}

function buildQuery(params?: SupplierQueryParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  if (params.search)              qs.set('search', params.search);
  if (params.status)              qs.set('status', params.status);
  if (params.materialIds?.length) params.materialIds.forEach(id => qs.append('materialIds', id));
  if (params.page != null)        qs.set('page', String(params.page - 1)); // Spring uses 0-based pages
  if (params.pageSize != null)    qs.set('size', String(params.pageSize));
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export const supplierApi = {
  async getSuppliers(params?: SupplierQueryParams): Promise<ApiResponse<SupplierListResponse>> {
    try {
      const raw = await apiRequest<PagedResponse<RawSupplier>>(
        `/api/procurement/suppliers${buildQuery(params)}`,
      );
      const content = Array.isArray(raw) ? raw : (raw.content ?? []);
      const total = Array.isArray(raw)
        ? content.length
        : (raw.page?.totalElements ?? content.length);
      return { success: true, data: { suppliers: content.map(normalizeSupplier), total } };
    } catch (err) {
      throw toRequestError(err);
    }
  },

  async createSupplier(payload: CreateSupplierPayload): Promise<ApiResponse<Supplier>> {
    try {
      const raw = await apiRequest<RawSupplier>('/api/procurement/suppliers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return { success: true, data: normalizeSupplier(raw) };
    } catch (err) {
      throw toRequestError(err);
    }
  },

  async suspendSupplier(id: string): Promise<ApiResponse<Supplier>> {
    try {
      const raw = await apiRequest<RawSupplier>(`/api/procurement/suppliers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ active: false }),
      });
      return { success: true, data: normalizeSupplier(raw) };
    } catch (err) {
      throw toRequestError(err);
    }
  },

  async activateSupplier(id: string): Promise<ApiResponse<Supplier>> {
    try {
      const raw = await apiRequest<RawSupplier>(`/api/procurement/suppliers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ active: true }),
      });
      return { success: true, data: normalizeSupplier(raw) };
    } catch (err) {
      throw toRequestError(err);
    }
  },

  async getSupplierById(id: string): Promise<ApiResponse<Supplier>> {
    try {
      const raw = await apiRequest<RawSupplier>(`/api/procurement/suppliers/${id}`);
      return { success: true, data: normalizeSupplier(raw) };
    } catch (err) {
      throw toRequestError(err);
    }
  },

  async updateSupplier(id: string, payload: UpdateSupplierPayload): Promise<ApiResponse<Supplier>> {
    try {
      const raw = await apiRequest<RawSupplier>(`/api/procurement/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return { success: true, data: normalizeSupplier(raw) };
    } catch (err) {
      throw toRequestError(err);
    }
  },
};
