
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DashboardHeader({ searchQuery, setSearchQuery }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row items-start md:items-center justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Overview of your job orders and performance metrics
        </p>
      </div>
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-40 sm:w-60 md:w-64"
          />
        </div>
      </div>
    </div>
  );
}
