
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
      <div className="flex items-center justify-center min-h-[200px] glass-gaming-strong gaming-pulse">
        <span className="text-lg text-gaming-glow">Checking permissions...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="glass-gaming p-4 rounded gaming-border">
        <div className="font-semibold text-gaming-glow">Role Access Error</div>
        <div className="text-gaming-glow">{error}</div>
        <div className="mt-2 text-xs text-gaming-glow">UserID: {userId || 'None'}</div>
      </div>
    );
  }
  if (!isAllowed) {
    return (
      <div className="space-y-6 glass-gaming-strong p-6 rounded-2xl">
        <div>
          <h1 className="text-3xl font-bold text-gaming-glow mb-2">Access Denied</h1>
          <p className="text-gaming-glow">You don't have permission to access the admin job management panel.</p>
          <div className="mt-4 p-2 border glass-gaming rounded text-xs">
            <b className="text-gaming-glow">Debug info:</b><br/>
            <span className="text-gaming-glow">UserID: {userId || 'None'}</span><br/>
            <span className="text-gaming-glow">Roles: {userRoles?.join(", ") || "None"}</span>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
