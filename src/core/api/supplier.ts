import { apiRequest } from './client';
import type { ApiResponse } from '@/types';

export type SupplierStatus = 'ACTIVE' | 'SUSPENDED';

export interface ApprovedItem {
  inventoryItemId: string;
  name: string;
}

export interface Supplier {
  id: string;
  fullName: string;
  companyName?: string;
  phoneNumber: string;
  phoneCountryCode?: string;
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

export interface UpdateSupplierPayload {
  contactPerson: string;
  companyName?: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email: string;
  notes?: string;
  approvedInventoryItemIds: string[];
}

// ── Backend shapes ────────────────────────────────────────────────────────────

interface BackendApprovedItem {
  inventoryItemId: string;
  name: string;
  unitOfMeasureLabel: string | null;
}

interface BackendSupplier {
  id: string;
  active: boolean;
  approvedItems: BackendApprovedItem[];
  companyName?: string;
  contactPerson: string;
  createdAt?: string;
  email: string;
  notes?: string;
  phoneCountryCode?: string;
  phoneNumber: string;
}

interface PaginatedContent<T> {
  content: T[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
}

function mapSupplier(b: BackendSupplier): Supplier {
  const items = b.approvedItems ?? [];
  return {
    id: b.id,
    fullName: b.contactPerson,
    companyName: b.companyName,
    phoneNumber: b.phoneNumber,
    phoneCountryCode: b.phoneCountryCode,
    email: b.email,
    notes: b.notes,
    status: b.active ? 'ACTIVE' : 'SUSPENDED',
    approvedItems: items.map(i => ({ inventoryItemId: i.inventoryItemId, name: i.name })),
    approvedInventoryItemIds: items.map(i => i.inventoryItemId),
    deliveryUnitIds: [],
    createdAt: b.createdAt,
  };
}

function toRequestError(err: unknown): Error {
  if (err instanceof Error) return err;
  return new Error('Request failed');
}

export const supplierApi = {
  async createSupplier(payload: CreateSupplierPayload): Promise<ApiResponse<Supplier>> {
    try {
      const created = await apiRequest<BackendSupplier>('/api/procurement/suppliers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return { success: true, data: mapSupplier(created) };
    } catch (err) {
      throw toRequestError(err);
    }
  },

  async updateSupplier(id: string, payload: UpdateSupplierPayload): Promise<ApiResponse<Supplier>> {
    try {
      const updated = await apiRequest<BackendSupplier>(`/api/procurement/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return { success: true, data: mapSupplier(updated) };
    } catch (err) {
      throw toRequestError(err);
    }
  },

  async getSupplierById(id: string): Promise<ApiResponse<Supplier>> {
    try {
      const supplier = await apiRequest<BackendSupplier>(`/api/procurement/suppliers/${id}`);
      return { success: true, data: mapSupplier(supplier) };
    } catch (err) {
      throw toRequestError(err);
    }
  },

  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    try {
      const page = await apiRequest<PaginatedContent<BackendSupplier>>(
        '/api/procurement/suppliers',
      );
      return { success: true, data: page.content.map(mapSupplier) };
    } catch (err) {
      throw toRequestError(err);
    }
  },

  async suspendSupplier(id: string): Promise<ApiResponse<Supplier>> {
    try {
      const updated = await apiRequest<BackendSupplier>(
        `/api/procurement/suppliers/${id}/status`,
        { method: 'PATCH', body: JSON.stringify({ active: false }) },
      );
      return { success: true, data: mapSupplier(updated) };
    } catch (err) {
      throw toRequestError(err);
    }
  },

  async activateSupplier(id: string): Promise<ApiResponse<Supplier>> {
    try {
      const updated = await apiRequest<BackendSupplier>(
        `/api/procurement/suppliers/${id}/status`,
        { method: 'PATCH', body: JSON.stringify({ active: true }) },
      );
      return { success: true, data: mapSupplier(updated) };
    } catch (err) {
      throw toRequestError(err);
    }
  },
};
