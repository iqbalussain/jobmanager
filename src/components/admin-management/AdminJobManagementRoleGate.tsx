
import { ReactNode } from "react";

interface AdminJobManagementRoleGateProps {
  loading: boolean;
  error: string | null;
  isAllowed: boolean;
  userId?: string;
  userRoles?: string[];
  children: ReactNode;
}

export function AdminJobManagementRoleGate({
  loading,
  error,
  isAllowed,
  userId,
  userRoles,
  children
}: AdminJobManagementRoleGateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-lg text-muted-foreground">Checking permissions...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded">
        <div className="font-semibold">Role Access Error</div>
        <div>{error}</div>
        <div className="mt-2 text-xs">UserID: {userId || 'None'}</div>
      </div>
    );
  }
  if (!isAllowed) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin job management panel.</p>
          <div className="mt-4 p-2 border bg-yellow-50 rounded text-xs">
            <b>Debug info:</b><br/>
            UserID: {userId || 'None'}<br/>
            Roles: {userRoles?.join(", ") || "None"}
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
