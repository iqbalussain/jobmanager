
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DashboardHeader({ searchQuery, setSearchQuery }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your job orders and performance metrics</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64 bg-background text-foreground"
          />
        </div>
      </div>
    </div>
  );
}

