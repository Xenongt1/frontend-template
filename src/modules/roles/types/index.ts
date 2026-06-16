// Domain types for the Role Management epic (CHAIN-183).
// Mock-first: shapes here are the contract the FE expects from the BE.
// Confirm with the BE team before they implement the real endpoints.

/** Identifier for a permission area (group). The label is resolved on the FE via i18n. */
export type PermissionAreaCode =
  | 'ITEM_CATALOGUE'
  | 'STOCK_LOCATIONS'
  | 'STOCK_INTAKE'
  | 'STOCK_VIEW'
  | 'STOCK_MOVEMENTS'
  | 'ACCESS_CONTROL';

export interface Permission {
  code: string;
  /** Optional human-readable label from the BE; FE prefers translating the code via i18n. */
  label?: string;
}

export interface PermissionArea {
  code: PermissionAreaCode;
  label?: string;
  permissions: Permission[];
}

/** A row on the Browse Roles page. Lightweight; doesn't include the full permission/member list. */
export interface RoleSummary {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  /** Up to N member objects for the avatar group on the browse table. */
  previewMembers?: RoleMember[];
  permissionCount: number;
  /** Whether this is a seeded system role (locked from rename/delete). */
  isSystem?: boolean;
}

/** A team member assigned to a role. Used by the View Role Details page. */
export interface RoleMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  /** ISO-8601 datetime when the role was assigned to this member. */
  assignedAt: string;
}

/** Full role detail returned by GET /roles/:id. */
export interface RoleDetail {
  id: string;
  name: string;
  description: string;
  /** Permission codes granted to this role. */
  grantedPermissions: string[];
  members: RoleMember[];
}

export interface RoleListResponse {
  data: RoleSummary[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface RoleListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

/** Payload for POST /roles and PATCH /roles/:id. */
export interface RoleWritePayload {
  name: string;
  description: string;
  grantedPermissions: string[];
}
