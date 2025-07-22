// Helper untuk pengecekan akses role

export function getCurrentUserRole() {
  try {
    const user = JSON.parse(localStorage.getItem('studio_pos_user') || '{}');
    return user.role || '';
  } catch {
    return '';
  }
}

export function hasAccess(menu: string, action: string): boolean {
  const role = getCurrentUserRole();
  if (role === 'Administrator') return true;
  const access = JSON.parse(localStorage.getItem('studio_pos_access_' + role) || '{}');
  return !!access?.[menu]?.[action];
} 