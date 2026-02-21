import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SyncStatusIndicator } from "@/components/ui/SyncStatusIndicator";
import { useRamadanTheme } from "@/App";

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DashboardHeader({ searchQuery, setSearchQuery }: DashboardHeaderProps) {
  const { isRamadan } = useRamadanTheme();

  return (
    <div className="flex items-center justify-between">
      <div>
        {isRamadan ? (
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🌙</span>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Ramadan Kareem</h1>
              <p className="text-muted-foreground text-sm">رمضان كريم — Wishing you a blessed month</p>
            </div>
            <span className="text-2xl">⭐</span>
          </div>
        ) : (
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        )}
        <p className="text-muted-foreground">Overview of your job orders and performance metrics</p>
      </div>
      <div className="flex items-center gap-4">
        <SyncStatusIndicator />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>
    </div>
  );
}
