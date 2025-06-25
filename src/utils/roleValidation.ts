
// Define allowed roles with strict validation
const allowedRoles = ["admin", "manager", "employee", "designer", "salesman"] as const;
export type Role = typeof allowedRoles[number];

export function isValidRole(role: string): role is Role {
  return allowedRoles.includes(role as Role);
}

// Define role permissions for job order management
export const rolePermissions = {
  canCreateJobOrders: ["admin", "manager", "salesman"],
  canViewAllJobOrders: ["admin", "manager"],
  canEditJobOrders: ["admin", "manager"],
  canDeleteJobOrders: ["admin", "manager"],
  canViewOwnJobOrders: ["admin", "manager", "salesman", "designer"],
  canManageCustomers: ["admin", "manager", "salesman"]
} as const;

export function hasPermission(userRole: Role, permission: keyof typeof rolePermissions): boolean {
  return rolePermissions[permission].includes(userRole);
}

export { allowedRoles };
