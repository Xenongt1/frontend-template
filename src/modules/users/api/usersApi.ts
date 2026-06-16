import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/core/api/client';
import { listRoles } from '@/modules/roles/api/rolesApi';

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export type MemberStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED';

export interface Member {
  id: string;
  fullName: string;
  email: string;
  imageUrl: string | null;
  status: MemberStatus;
  roles: string[];
  invitedAt: string;
  lastSignInAt?: string | null;
}

export interface MemberDetailRole {
  id: string;
  name: string;
  description?: string;
}

export interface MemberDetail {
  id: string;
  fullName: string;
  email: string;
  imageUrl: string | null;
  status: MemberStatus;
  roles: MemberDetailRole[];
  createdAt?: string;
  invitedAt?: string;
  lastSignInAt?: string | null;
}

type RawRole = string | { id?: string; name?: string; description?: string };

interface BackendListResponse<T> {
  data?: T[];
  content?: T[];
  members?: T[];
  page?: number;
  pageSize?: number;
  size?: number;
  totalItems?: number;
  totalElements?: number;
  totalPages?: number;
}

function normalizeMember(raw: unknown): Member {
  const r = (raw ?? {}) as Record<string, unknown>;
  const rawRoles = Array.isArray(r.roles) ? (r.roles as RawRole[]) : [];
  return {
    id: (r.id as string) ?? '',
    fullName: (r.fullName as string) ?? (r.name as string) ?? '',
    email: (r.email as string) ?? '',
    imageUrl: (r.imageUrl as string | null) ?? (r.avatarUrl as string | null) ?? null,
    status: (r.status as MemberStatus) ?? 'ACTIVE',
    roles: rawRoles.map((role) => typeof role === 'string' ? role : (role.name ?? role.id ?? '')).filter(Boolean),
    invitedAt: (r.invitedAt as string) ?? (r.createdAt as string) ?? '',
    lastSignInAt: (r.lastSignInAt as string | null | undefined) ?? null,
  };
}

function normalizeMemberDetail(raw: unknown): MemberDetail {
  const r = (raw ?? {}) as Record<string, unknown>;
  const rawRoles = Array.isArray(r.roles) ? (r.roles as RawRole[]) : [];
  const roles: MemberDetailRole[] = rawRoles.map((role) =>
    typeof role === 'string'
      ? { id: role, name: role }
      : { id: role.id ?? role.name ?? '', name: role.name ?? role.id ?? '', description: role.description },
  );
  return {
    id: (r.id as string) ?? '',
    fullName: (r.fullName as string) ?? (r.name as string) ?? '',
    email: (r.email as string) ?? '',
    imageUrl: (r.imageUrl as string | null) ?? (r.avatarUrl as string | null) ?? null,
    status: (r.status as MemberStatus) ?? 'ACTIVE',
    roles,
    createdAt: r.createdAt as string | undefined,
    invitedAt: r.invitedAt as string | undefined,
    lastSignInAt: (r.lastSignInAt as string | null | undefined) ?? null,
  };
}

export interface MembersListResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  data: Member[];
}

export interface GetMembersParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  desc?: boolean;
  search?: string;
  role?: string;
  status?: string;
}

export interface InviteMemberPayload {
  fullName: string;
  email: string;
  roleIds: string[];
}

export interface InviteMemberResponse {
  id: string;
  fullName: string;
  email: string;
  imageUrl: string | null;
  status: 'INVITED';
  roles: string[];
  invitedAt: string;
}

export const usersQueryKeys = {
  members: (params: GetMembersParams) => ['users', 'members', params] as const,
  member: (id: string) => ['users', 'member', id] as const,
  roles: ['users', 'roles'] as const,
};

export async function getMembers({ page = 0, pageSize = 20, sort, desc, search, role, status }: GetMembersParams = {}): Promise<MembersListResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (sort) params.set('sort', sort);
  if (desc !== undefined) params.set('desc', String(desc));
  if (search) params.set('search', search);
  if (role) params.set('role', role);
  if (status) params.set('status', status);

  const response = await apiRequest<BackendListResponse<unknown> | unknown[]>(`/api/members?${params.toString()}`);
  const list = Array.isArray(response)
    ? response
    : response.data ?? response.content ?? response.members ?? [];
  const data = list.map(normalizeMember);
  const totalItems = Array.isArray(response)
    ? data.length
    : response.totalItems ?? response.totalElements ?? data.length;
  const resolvedPageSize = Array.isArray(response) ? pageSize : response.pageSize ?? response.size ?? pageSize;

  return {
    page: Array.isArray(response) ? page : response.page ?? page,
    pageSize: resolvedPageSize,
    totalItems,
    totalPages: Array.isArray(response)
      ? Math.max(1, Math.ceil(totalItems / Math.max(1, resolvedPageSize)))
      : response.totalPages ?? Math.max(1, Math.ceil(totalItems / Math.max(1, resolvedPageSize))),
    data,
  };
}

export async function getMemberById(id: string): Promise<MemberDetail> {
  const response = await apiRequest<unknown>(`/api/members/${id}`);
  return normalizeMemberDetail(response);
}

export async function getRoles(): Promise<Role[]> {
  const response = await listRoles({ page: 1, pageSize: 200 });
  return response.data.map((role) => ({ id: role.id, name: role.name, description: role.description }));
}

export async function inviteMember(payload: InviteMemberPayload): Promise<InviteMemberResponse> {
  const response = await apiRequest<unknown>('/api/members', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeMember(response) as InviteMemberResponse;
}

export async function suspendMember(id: string): Promise<Member> {
  return normalizeMember(await apiRequest<unknown>(`/api/members/${id}/suspend`, { method: 'PATCH' }));
}

export async function activateMember(id: string): Promise<Member> {
  return normalizeMember(await apiRequest<unknown>(`/api/members/${id}/activate`, { method: 'PATCH' }));
}

export async function addMemberRole({ memberId, roleId }: { memberId: string; roleId: string }): Promise<void> {
  await apiRequest<unknown>(`/api/members/${memberId}/roles/${roleId}`, { method: 'POST' });
}

export async function removeMemberRole({ memberId, roleId }: { memberId: string; roleId: string }): Promise<void> {
  await apiRequest<unknown>(`/api/members/${memberId}/roles/${roleId}`, { method: 'DELETE' });
}

export function useMembersQuery(params: GetMembersParams) {
  return useQuery({
    queryKey: usersQueryKeys.members(params),
    queryFn: () => getMembers(params),
  });
}

export function useMemberQuery(id: string) {
  return useQuery({
    queryKey: usersQueryKeys.member(id),
    queryFn: () => getMemberById(id),
    enabled: Boolean(id),
  });
}

export function useRolesQuery(enabled = true) {
  return useQuery({
    queryKey: usersQueryKeys.roles,
    queryFn: getRoles,
    enabled,
  });
}

export function useInviteMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inviteMember,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', 'members'] }),
  });
}

export function useSuspendMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suspendMember,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'members'] });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.member(id) });
    },
  });
}

export function useActivateMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateMember,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'members'] });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.member(id) });
    },
  });
}

export function useAddMemberRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMemberRole,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'members'] });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.member(variables.memberId) });
    },
  });
}

export function useRemoveMemberRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeMemberRole,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'members'] });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.member(variables.memberId) });
    },
  });
}

// Compatibility layer for the users UI ported from the testing branch. These
// expose the old RTK Query hook names while delegating to TanStack Query.
export function useGetMembersQuery(params: GetMembersParams, _options?: { refetchOnMountOrArgChange?: boolean }) {
  return useMembersQuery(params);
}

export function useGetMemberByIdQuery(id: string, options?: { skip?: boolean }) {
  return useQuery({
    queryKey: usersQueryKeys.member(id),
    queryFn: () => getMemberById(id),
    enabled: Boolean(id) && !options?.skip,
  });
}

export function useGetRolesQuery(_arg?: undefined, options?: { skip?: boolean }) {
  return useRolesQuery(!options?.skip);
}

export function useInviteMemberMutationCompat() {
  const mutation = useInviteMemberMutation();
  const trigger = (payload: InviteMemberPayload) => ({ unwrap: () => mutation.mutateAsync(payload) });
  return [trigger, { isLoading: mutation.isPending }] as const;
}

export function useSuspendMemberMutationCompat() {
  const mutation = useSuspendMemberMutation();
  const trigger = (id: string) => ({ unwrap: () => mutation.mutateAsync(id) });
  return [trigger, { isLoading: mutation.isPending }] as const;
}

export function useActivateMemberMutationCompat() {
  const mutation = useActivateMemberMutation();
  const trigger = (id: string) => ({ unwrap: () => mutation.mutateAsync(id) });
  return [trigger, { isLoading: mutation.isPending }] as const;
}

export function useAddMemberRoleMutationCompat() {
  const mutation = useAddMemberRoleMutation();
  const trigger = (payload: { memberId: string; roleId: string }) => ({ unwrap: () => mutation.mutateAsync(payload) });
  return [trigger, { isLoading: mutation.isPending }] as const;
}

export function useRemoveMemberRoleMutationCompat() {
  const mutation = useRemoveMemberRoleMutation();
  const trigger = (payload: { memberId: string; roleId: string }) => ({ unwrap: () => mutation.mutateAsync(payload) });
  return [trigger, { isLoading: mutation.isPending }] as const;
}
