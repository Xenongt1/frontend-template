// Fetches the backend's permission catalogue (`GET /api/permissions`) and
// groups it into the same shape the Role form / detail components already
// consume. Replaces the hand-maintained `permissionCatalogue.ts` static
// file as the source of truth — whatever the backend serves is what the FE
// renders, so there's no more code-format drift between the two sides.

import { useEffect, useState } from 'react';
import { apiRequest } from '@/core/api/client';
import type { PermissionAreaDefinition } from '../data/permissionCatalogue';

interface BackendPermission {
  id: string;
  code: string;
  label: string;
  description: string;
  module: string;
  action: string;
}

interface BackendPermissionsResponse {
  data: BackendPermission[];
}

/**
 * Turn an UPPER_SNAKE module code into a Title Case label.
 * INVENTORY_ITEMS → "Inventory items".
 */
function humanizeModule(code: string): string {
  const lower = code.replace(/_/g, ' ').toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function groupByModule(permissions: BackendPermission[]): PermissionAreaDefinition[] {
  const buckets = new Map<string, BackendPermission[]>();
  for (const p of permissions) {
    const key = p.module || 'OTHER';
    const list = buckets.get(key) ?? [];
    list.push(p);
    buckets.set(key, list);
  }

  return Array.from(buckets.entries()).map(([module, perms]) => ({
    code: module,
    // Direct title string (no i18n key). PermissionGroup prefers `title`
    // over `titleKey` when both are present.
    title: humanizeModule(module),
    permissions: perms.map((p) => ({
      code: p.code,
      // Direct label + hint strings from the backend.
      label: p.label,
      hint: p.description,
    })),
  }));
}

interface UsePermissionCatalogueResult {
  catalogue: PermissionAreaDefinition[];
  loading: boolean;
  error: string | null;
}

export function usePermissionCatalogue(): UsePermissionCatalogueResult {
  const [catalogue, setCatalogue] = useState<PermissionAreaDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiRequest<BackendPermissionsResponse>('/api/permissions')
      .then((response) => {
        if (cancelled) return;
        setCatalogue(groupByModule(response.data ?? []));
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load permissions');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { catalogue, loading, error };
}
