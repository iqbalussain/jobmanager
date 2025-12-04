// Define allowed roles with strict validation
const allowedRoles = ["admin", "manager", "job_order_manager", "employee", "designer", "salesman"] as const;
export type Role = typeof allowedRoles[number];

export function isValidRole(role: string): role is Role {
  return allowedRoles.includes(role as Role);
}

// Define role permissions for job order management
export const rolePermissions = {
  canCreateJobOrders: ["admin", "manager", "job_order_manager", "salesman"],
  canViewAllJobOrders: ["admin", "manager", "job_order_manager"],
  canEditJobOrders: ["admin", "manager", "job_order_manager"],
  canDeleteJobOrders: ["admin", "manager"],
  canViewOwnJobOrders: ["admin", "manager", "job_order_manager", "salesman", "designer"],
  canManageCustomers: ["admin", "manager", "job_order_manager", "salesman"]
} as const;

export function hasPermission(userRole: Role, permission: keyof typeof rolePermissions): boolean {
  return (rolePermissions[permission] as readonly Role[]).includes(userRole);
}

export { allowedRoles };
