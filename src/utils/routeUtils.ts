
import { useLocation } from "react-router-dom";

export type ViewType =
  | "dashboard"
  | "jobs"
  | "create"
  | "settings"
  | "admin"
  | "admin-management"
  | "reports"
  | "unapproved-jobs"
  | "approved-jobs"
  | "branch-queue";

export function useCurrentView(): ViewType {
  const location = useLocation();
  
  const getCurrentView = (): ViewType => {
    const path = location.pathname;
    switch (path) {
      case "/":
        return "dashboard";
      case "/jobs":
        return "jobs";
      case "/create":
        return "create";
      case "/settings":
        return "settings";
      case "/admin":
        return "admin";
      case "/admin-management":
        return "admin-management";
      case "/reports":
        return "reports";
      case "/unapproved-jobs":
        return "unapproved-jobs";
      case "/approved-jobs":
        return "approved-jobs";
      case "/branch-queue":
        return "branch-queue";
      default:
        return "dashboard";
    }
  };

  return getCurrentView();
}
