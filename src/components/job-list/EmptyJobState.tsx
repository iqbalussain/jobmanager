
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export function EmptyJobState() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Briefcase className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
        <p className="text-gray-600">Try adjusting your search criteria or filters</p>
      </CardContent>
    </Card>
  );
}
