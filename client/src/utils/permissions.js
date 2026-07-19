export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.role !== "ADMIN") return false;
  const permissions = user.permissions || [];
  return permissions.includes("*") || permissions.includes(permission);
};
