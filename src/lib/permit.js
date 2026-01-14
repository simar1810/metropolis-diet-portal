export function permit(role, roles) {
  if (roles.includes(role)) return true;
  return false;
}