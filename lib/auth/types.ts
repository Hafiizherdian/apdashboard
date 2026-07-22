// lib/auth/types.ts

export type UserRole = 'root' | 'admin' | 'user';
export type ScopeType = 'all' | 'regional' | 'area';

export interface SessionUser {
  id:       string;
  username: string;
  email:    string;
  role:     UserRole;
  scope_type: ScopeType;
  // allowed_areas SELALU berisi daftar area id yang SUDAH DIRESOLVE
  // (kalau scope_type = 'regional', ini hasil ekspansi semua area di regional tsb;
  //  kalau scope_type = 'all' atau role root/admin, boleh dikosongkan — canAccessArea akan return true).
  allowed_areas: string[]; // Array of area IDs this user can access
  allowed_regionals: string[];
}

export interface JWTPayload extends SessionUser {
  iat: number;
  exp: number;
}

// ─── Permission map ───────────────────────────────────────────────────────────
export const PERMISSIONS = {
  // File / data
  upload_file:    ['root', 'admin'],
  delete_file:    ['root', 'admin'],
  view_files:     ['root', 'admin', 'user'],
  preview_file:   ['root', 'admin', 'user'],

  // Stats / dashboard
  view_stats:     ['root', 'admin', 'user'],

  // Area management
  manage_areas:   ['root'],
  view_areas:     ['root', 'admin', 'user'],

  // User management
  manage_users:   ['root'],
  view_users:     ['root'],

  // Settings
  run_migration:  ['root'],
  view_settings:  ['root'],

  // Admin panel access
  access_admin_panel: ['root', 'admin'],
  view_all_areas: ['root'],
} as const satisfies Record<string, UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: UserRole, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

// ─── Area-based access control utilities ───────────────────────────────
export function canAccessArea(user: SessionUser, areaId: string): boolean {
  if (user.role === 'root' || user.role === 'admin') return true;
  if (user.scope_type === 'all') return true;
  return user.allowed_areas.includes(areaId);
}

export function canAccessRegional(user: SessionUser, regionalId: string): boolean {
  if (user.role === 'root' || user.role === 'admin') return true;
  if (user.scope_type === 'all') return true;
  if (user.scope_type === 'regional') return user.allowed_regionals.includes(regionalId);
  return false; // scope 'area' tidak punya akses tingkat regional
}

export function getAccessibleAreas(user: SessionUser): string[] {
  // Kosong = akses semua (dipakai buat root/admin/scope 'all')
  if (user.role === 'root' || user.role === 'admin' || user.scope_type === 'all') return [];
  return user.allowed_areas;
}

export function filterUserAreas(user: SessionUser, allAreas: { id: string }[]): typeof allAreas {
  const accessible = getAccessibleAreas(user);
  if (accessible.length === 0 && (user.role === 'root' || user.role === 'admin' || user.scope_type === 'all')) {
    return allAreas;
  }
  return allAreas.filter(area => accessible.includes(area.id));
}

export const ROLE_LABELS: Record<UserRole, string> = {
  root:  'Root',
  admin: 'Admin',
  user:  'User',
};

export const SCOPE_LABELS: Record<ScopeType, string> = {
  all:      'Semua Regional & Area',
  regional: 'Regional Tertentu',
  area:     'Area Tertentu',
};

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  root:  { bg: 'rgba(139,92,246,0.1)', text: '#c4b5fd', border: 'rgba(139,92,246,0.3)' },
  admin: { bg: 'rgba(37,99,235,0.1)',  text: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
  user:  { bg: 'rgba(16,185,129,0.08)',text: '#6ee7b7', border: 'rgba(16,185,129,0.2)' },
};

export const ROLE_COLORS_LIGHT: Record<UserRole, { bg: string; text: string; border: string }> = {
  root:  { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
  admin: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  user:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
};