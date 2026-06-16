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

export const supplierApi = {
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

  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    try {
      const raw = await apiRequest<PagedResponse<RawSupplier>>('/api/procurement/suppliers');
      const content = Array.isArray(raw) ? raw : (raw.content ?? []);
      return { success: true, data: content.map(normalizeSupplier) };
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
      const raw = await apiRequest<RawSupplier>(`/api/procurement/suppliers/${id}/status `, {
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
