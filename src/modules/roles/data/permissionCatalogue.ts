// Type definitions consumed by the role-permission components.
//
// The runtime catalogue used to live here too, but is now fetched from the
// backend via `usePermissionCatalogue`. These interfaces describe the shape
// that hook returns (and the shape the components expect), kept here only
// because several components import `PermissionDefinition` and
// `PermissionAreaDefinition` as type-only imports.

export interface PermissionDefinition {
  // `code` is intentionally `string` so backend-supplied codes typecheck.
  code: string;
  /** Direct label string (backend-provided). Preferred over labelKey. */
  label?: string;
  /** Direct hint/description string (backend-provided). */
  hint?: string;
  /** Legacy i18n key for the label, retained for any caller still using it. */
  labelKey?: string;
  /** Legacy i18n key for the info tooltip. */
  hintKey?: string;
}

export interface PermissionAreaDefinition {
  code: string;
  /** Direct title string (backend-provided or derived). */
  title?: string;
  /** Legacy i18n key for the area title. */
  titleKey?: string;
  permissions: PermissionDefinition[];
}
