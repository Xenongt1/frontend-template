import type {
  InventoryItem,
  InventoryStatus,
  InventoryAttribute,
  InventoryBatchField,
  InventoryGrade,
  ExpiryNotificationRule,
  InventoryTag,
  InventoryListQuery,
  InventoryListResponse,
  FilterOption,
  InventoryQueryParams,
  InventoryApiResponse,
} from '@/types';

export type {
  InventoryItem,
  InventoryStatus,
  InventoryAttribute,
  InventoryBatchField,
  InventoryGrade,
  ExpiryNotificationRule,
  InventoryTag,
  InventoryListQuery,
  InventoryListResponse,
  FilterOption,
  InventoryQueryParams,
  InventoryApiResponse,
};

export interface InventoryFilters {
  search: string;
  category: string;
  status: InventoryStatus | 'All';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}
