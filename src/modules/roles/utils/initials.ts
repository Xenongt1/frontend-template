/**
 * Two-letter initials derived from a member's display name. Used as the
 * fallback swatch when no avatar image is uploaded.
 *
 * Falls back to `?` for empty input so the swatch is never blank.
 */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}
