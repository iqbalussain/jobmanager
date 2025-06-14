import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Package, 
  Briefcase, 
  BarChart3, 
  ArrowDown, 
  ArrowUp, 
  ArrowLeft, 
  ArrowRight 
} from "lucide-react";

interface ShortcutGadgetsProps {
  onViewChange?: (view: "dashboard" | "jobs" | "create" | "calendar" | "settings" | "admin" | "admin-management") => void;
}

export function ShortcutGadgets({ onViewChange }: ShortcutGadgetsProps) {
  const shortcuts = [
    {
      title: "Create Customer",
      icon: ArrowUp,
      iconColor: "text-green-500",
      btnBg: "bg-green-100",
      color: "from-green-300 to-green-400",
      action: () => onViewChange?.("admin-management")
    },
    {
      title: "Create Item",
      icon: ArrowDown,
      iconColor: "text-pink-500",
      btnBg: "bg-pink-100",
      color: "from-pink-300 to-pink-400",
      action: () => onViewChange?.("admin")
    },
    {
      title: "Quick Job",
      icon: ArrowLeft,
      iconColor: "text-violet-500",
      btnBg: "bg-violet-100",
      color: "from-violet-300 to-violet-400",
      action: () => onViewChange?.("create")
    },
    {
      title: "Reports",
      icon: ArrowRight,
      iconColor: "text-yellow-500",
      btnBg: "bg-yellow-100",
      color: "from-yellow-300 to-yellow-400",
      action: () => onViewChange?.("jobs")
    }
  ];

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50 h-full rounded-2xl overflow-hidden">
      <CardContent className="p-4 h-full">
        <h3 className="text-sm font-semibold text-blue-700 mb-4 text-center">Quick Actions</h3>
        <div className="space-y-3 h-full flex flex-col justify-center">
          {shortcuts.map((shortcut) => {
            const IconComponent = shortcut.icon;
            return (
              <Button
                key={shortcut.title}
                onClick={shortcut.action}
                variant="ghost"
                className={`border-0 p-3 h-auto flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md rounded-xl ${shortcut.btnBg}`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${shortcut.color} shadow-lg`}>
                  <IconComponent className={`w-4 h-4 ${shortcut.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-blue-700 text-center leading-tight">
                  {shortcut.title}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
