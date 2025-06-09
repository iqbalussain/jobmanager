
// Define allowed roles with strict validation
const allowedRoles = ["admin", "manager", "employee", "designer", "salesman", "job_order_manager"] as const;
export type Role = typeof allowedRoles[number];

export function isValidRole(role: string): role is Role {
  return allowedRoles.includes(role as Role);
}

export { allowedRoles };
