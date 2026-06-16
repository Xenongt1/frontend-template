// Frontend API client for the Role Management epic.
// Wired to the real backend via the shared apiRequest helper (which emits
// relative `/api/...` URLs that nginx proxies to the backend in prod and the
// Vite dev proxy handles in dev).
//
// BE contract (confirmed via swagger probe on 2026-06-09):
//   GET    /api/roles                  → { data: BackendRole[] [+ pagination] }
//   GET    /api/roles/{id}             → BackendRole
//   POST   /api/roles                  → BackendRole
//   PATCH  /api/roles/{id}             → BackendRole
//   GET    /api/permissions            → { data: BackendPermission[] }
//
// BackendRole shape:
//   { id, name, description, members: BackendMember[], permissions: BackendPermission[] }
// BE returns the FULL permissions[] array on both browse and detail (it has not
// yet split the shapes). For browse we just take permissions.length as the count.

import { apiRequest } from '@/core/api/client';
import type {
  RoleDetail,
  RoleListQuery,
  RoleListResponse,
  RoleMember,
  RoleSummary,
  RoleWritePayload,
} from '../types';

// ─── Backend shapes (what the wire looks like) ──────────────────────────────

interface BackendPermission {
  id: string;
  code: string;
  label: string;
  description: string;
  module: string;
  action: string;
}

interface BackendMember {
  id: string;
  fullName?: string;
  name?: string;
  // BE returns the avatar URL under `imageUrl`; older shapes used `avatarUrl`.
  // Accept both so this client survives either contract.
  imageUrl?: string | null;
  avatarUrl?: string | null;
  email?: string;
  assignedAt?: string;
}

interface BackendRole {
  id: string;
  name: string;
  description: string | null;
  members: BackendMember[] | null;
  // BE exposes the total member count separately so the FE doesn't have to
  // rely on members.length when the BE only returns a preview slice.
  memberCount?: number;
  permissions: BackendPermission[] | null;
  // BE returns this on browse. `system` was the original field name; treat
  // either as the source of truth.
  isSystem?: boolean;
  system?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendListResponse<T> {
  data: T[];
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function toSummary(role: BackendRole): RoleSummary {
  const memberObjects = (role.members ?? []).map(toMember);
  return {
    id: role.id,
    name: role.name,
    description: role.description ?? '',
    // Prefer the BE's explicit memberCount when present so the +N overflow
    // badge stays accurate even if the BE later trims the members array to a
    // preview slice.
    memberCount: role.memberCount ?? memberObjects.length,
    previewMembers: memberObjects,
    permissionCount: role.permissions?.length ?? 0,
    isSystem: role.isSystem ?? role.system ?? false,
  };
}

function toMember(member: BackendMember): RoleMember {
  return {
    id: member.id,
    name: member.fullName ?? member.name ?? '',
    email: member.email ?? '',
    avatarUrl: member.imageUrl ?? member.avatarUrl ?? undefined,
    assignedAt: member.assignedAt ?? '',
  };
}

function toDetail(role: BackendRole): RoleDetail {
  return {
    id: role.id,
    name: role.name,
    description: role.description ?? '',
    grantedPermissions: (role.permissions ?? []).map((p) => p.code),
    members: (role.members ?? []).map(toMember),
  };
}

// ─── API calls ───────────────────────────────────────────────────────────────

export async function listRoles(query: RoleListQuery = {}): Promise<RoleListResponse> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.page) params.set('page', String(query.page - 1)); // BE is 0-indexed
  if (query.pageSize) params.set('size', String(query.pageSize));
  const qs = params.toString();

  const url = qs ? `/api/roles?${qs}` : '/api/roles';
  const response = await apiRequest<BackendListResponse<BackendRole>>(url);

  const summaries = response.data.map(toSummary);

  // BE may not paginate yet. Fall back to client-side counts so the UI still works.
  const requestedPage = query.page ?? 1;
  const requestedSize = query.pageSize ?? (summaries.length || 20);
  const total = response.totalItems ?? summaries.length;
  return {
    data: summaries,
    pagination: {
      page: typeof response.page === 'number' ? response.page + 1 : requestedPage,
      limit: response.pageSize ?? requestedSize,
      totalItems: total,
      totalPages: response.totalPages ?? Math.max(1, Math.ceil(total / Math.max(1, requestedSize))),
    },
  };
}

export async function getRoleById(id: string): Promise<RoleDetail> {
  const role = await apiRequest<BackendRole>(`/api/roles/${id}`);
  return toDetail(role);
}

export async function createRole(payload: RoleWritePayload): Promise<RoleDetail> {
  const created = await apiRequest<BackendRole>('/api/roles', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name.trim(),
      description: payload.description.trim(),
      // BE accepts permission codes as strings.
      permissions: payload.grantedPermissions,
    }),
  });
  return toDetail(created);
}

export async function updateRole(id: string, payload: RoleWritePayload): Promise<RoleDetail> {
  const updated = await apiRequest<BackendRole>(`/api/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: payload.name.trim(),
      description: payload.description.trim(),
      permissions: payload.grantedPermissions,
    }),
  });
  return toDetail(updated);
}
