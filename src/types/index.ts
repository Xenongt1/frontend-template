export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ContractPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface InventoryListResponse extends ApiResponse<InventoryItem[]> {
  pagination: ContractPagination;
}

export interface InventoryListQuery {
  search?: string;
  category?: string;
  status?: InventoryStatus | 'All';
  grade?: string;
  page?: number;
  limit?: number;
}

export type InventoryStatus = 'ACTIVE' | 'INACTIVE' | 'INTAKE_SUSPENDED';

export type ExpiryRuleUnit = 'DAYS' | 'WEEKS' | 'MONTHS';

export interface InventoryProperty {
  id: string;
  type: string;
  label: string;
  value: string | number | boolean;
}

export interface StockIntakeProperty {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

export interface InventoryAttribute {
  label: string;
  value: string;
  type?: string;
}

export interface InventoryBatchField {
  label: string;
  required: boolean;
  type?: string;
}

export interface InventoryGrade {
  id?: string;
  name: string;
  rank: number;
  description?: string;
}

export interface ExpiryNotificationRule {
  duration: number;
  unit: ExpiryRuleUnit;
}

export interface InventoryTag {
  id?: string;
  name: string;
  color: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  displayName: string;
  description?: string;
  category: string;
  stockUnit: number;
  uomLabel: string;
  status: InventoryStatus;
  properties: InventoryProperty[];
  stockIntakeProperties: StockIntakeProperty[];
  tags: string[];
  daysBeforeExpiryNotification?: number;
  minStockNotificationLevel?: number;
  minStockReorderLevel?: number;
  notifyExpiryEnabled?: boolean;
  notifyOnMinStockEnabled?: boolean;
  reorderOnMinStockEnabled?: boolean;
  createdAt?: string;
  baseUnitOfMeasure?: string;
  attributes?: InventoryAttribute[];
  batchFields?: InventoryBatchField[];
  grades?: InventoryGrade[];
  expiryNotificationSchedule?: ExpiryNotificationRule[];
  expiryNotificationDays?: number;
  reorderThreshold?: number;
}

export interface CreateInventoryItemPayload {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  unitOfMeasureId: string;
  reorderThreshold?: number;
  expiryNotificationDays?: number | null;
  grades: InventoryGrade[];
  attributes: InventoryAttribute[];
  batchFields: InventoryBatchField[];
}

export interface Category {
  id: string;
  name: string;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
}

export interface GradeLookup {
  id: string;
  name: string;
}

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

export interface InventoryQueryParams {
  search?: string;
  category?: string;
  status?: InventoryStatus | 'All';
  page: number;
  pageSize: number;
}

export interface InventoryApiResponse {
  items: InventoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

export type StorageLocationStatus = 'ACTIVE' | 'INACTIVE';

export interface StockLocation {
  id: string;
  name: string;
  description?: string;
  status: StorageLocationStatus;
  intakeBatchesCount?: number;
  createdAt?: string;
}

export interface StorageLocationListResponse {
  success: boolean;
  data: StockLocation[];
  pagination: ContractPagination;
}

export interface CreateStockLocationPayload {
  name: string;
  description?: string;
}

export interface UpdateStockLocationPayload {
  name: string;
  description?: string;
}
