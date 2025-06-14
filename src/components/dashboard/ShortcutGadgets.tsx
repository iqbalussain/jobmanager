
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Package, 
  Briefcase, 
  BarChart3 
} from "lucide-react";

interface ShortcutGadgetsProps {
  onViewChange?: (view: "dashboard" | "jobs" | "create" | "calendar" | "settings" | "admin" | "admin-management") => void;
  floating?: boolean;
}

export function ShortcutGadgets({ onViewChange, floating }: ShortcutGadgetsProps) {
  const shortcuts = [
    {
      title: "Create Customer",
      icon: UserPlus,
      color: "from-blue-500 to-blue-600",
      action: () => onViewChange?.("admin-management")
    },
    {
      title: "Create Item",
      icon: Package,
      color: "from-green-500 to-green-600",
      action: () => onViewChange?.("admin")
    },
    {
      title: "Quick Job",
      icon: Briefcase,
      color: "from-purple-500 to-purple-600",
      action: () => onViewChange?.("create")
    },
    {
      title: "Reports",
      icon: BarChart3,
      color: "from-orange-500 to-orange-600",
      action: () => onViewChange?.("jobs")
    }
  ];

  if (floating) {
    return (
      <div className="fixed z-50 bottom-8 right-8 flex flex-col gap-3 glass-card shadow-xl p-3 bg-white/50 border rounded-2xl backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
        {shortcuts.map((shortcut) => {
          const IconComponent = shortcut.icon;
          return (
            <Button
              key={shortcut.title}
              onClick={shortcut.action}
              variant="ghost"
              className={`flex items-center gap-2 mb-1 bg-gradient-to-r ${shortcut.color} text-white rounded-xl px-4 py-2 hover:scale-105 transition-all shadow border-0`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs md:text-sm font-semibold">{shortcut.title}</span>
            </Button>
          );
        })}
      </div>
    );
  }

  // fallback for old non-floating style if needed
  return null; 
}
