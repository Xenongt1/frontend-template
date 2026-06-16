import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/core/api/client';

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInUser {
  id: string;
  fullName: string;
  email: string;
  imageUrl: string | null;
  roles: string[];
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: SignInUser;
}

export interface InviteDetailsResponse {
  fullName: string;
  email: string;
}

export interface AcceptInvitePayload {
  token: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

const ACCESS_TOKEN_KEY = 'chainpilot_access_token';
const REFRESH_TOKEN_KEY = 'chainpilot_refresh_token';
const USER_KEY = 'chainpilot_user';

export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  return apiRequest<SignInResponse>('/api/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signOut(): Promise<void> {
  try {
    await apiRequest<void>('/api/auth/sign-out', { method: 'POST' });
  } catch {
    // Even if the server call fails, we still want to clear local state.
  }
  clearAuthStorage();
}

export async function getInviteDetails(token: string): Promise<InviteDetailsResponse> {
  return apiRequest<InviteDetailsResponse>(
    `/api/auth/accept-invite?token=${encodeURIComponent(token)}`,
  );
}

export async function acceptInvite(payload: AcceptInvitePayload): Promise<SignInResponse> {
  return apiRequest<SignInResponse>('/api/auth/accept-invite', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function storeAuth(result: SignInResponse): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(result.user));
}

export function clearAuthStorage(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function loadAuthUser(): SignInUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SignInUser) : null;
  } catch {
    return null;
  }
}

export function hasAccessToken(): boolean {
  return typeof localStorage !== 'undefined' && !!localStorage.getItem(ACCESS_TOKEN_KEY);
}

// ─── React Query hooks ────────────────────────────────────────────────────────

export function useSignInMutation() {
  return useMutation({ mutationFn: signIn });
}

export function useSignOutMutation() {
  return useMutation({ mutationFn: signOut });
}

export function useInviteDetailsQuery(token: string) {
  return useQuery({
    queryKey: ['auth', 'invite-details', token],
    queryFn: () => getInviteDetails(token),
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptInviteMutation() {
  return useMutation({ mutationFn: acceptInvite });
}

/** Read-only hook for the currently signed-in user. Reads localStorage once on mount. */
export function useAuthUser(): SignInUser | null {
  return loadAuthUser();
}
