
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
}

export function ShortcutGadgets({ onViewChange }: ShortcutGadgetsProps) {
  const shortcuts = [
    {
      title: "Create Customer",
      icon: UserPlus,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      action: () => onViewChange?.("admin-management")
    },
    {
      title: "Create Item",
      icon: Package,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      action: () => onViewChange?.("admin")
    },
    {
      title: "Quick Job",
      icon: Briefcase,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-100",
      action: () => onViewChange?.("create")
    },
    {
      title: "Reports",
      icon: BarChart3,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-100",
      action: () => onViewChange?.("jobs")
    }
  ];

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 h-full rounded-2xl overflow-hidden">
      <CardContent className="p-4 h-full">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">Quick Actions</h3>
        <div className="space-y-3 h-full flex flex-col justify-center">
          {shortcuts.map((shortcut) => {
            const IconComponent = shortcut.icon;
            return (
              <Button
                key={shortcut.title}
                onClick={shortcut.action}
                variant="ghost"
                className={`${shortcut.bgColor} ${shortcut.hoverColor} border-0 p-3 h-auto flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md rounded-xl`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${shortcut.color} shadow-lg`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">
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
