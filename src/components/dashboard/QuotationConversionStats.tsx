import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, FileCheck, FileText } from "lucide-react";
import { useQuotations } from "@/hooks/useQuotations";
import { Progress } from "@/components/ui/progress";

export const QuotationConversionStats = memo(function QuotationConversionStats() {
  const { quotations, isLoading } = useQuotations();

  const totalQuotations = quotations.length;
  const convertedQuotations = quotations.filter(q => q.status === 'converted').length;
  const conversionRate = totalQuotations > 0 ? (convertedQuotations / totalQuotations) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Conversion Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Conversion Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <FileText className="h-4 w-4" />
              <span>Total Quotations</span>
            </div>
            <div className="text-3xl font-bold">{totalQuotations}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <FileCheck className="h-4 w-4" />
              <span>Converted</span>
            </div>
            <div className="text-3xl font-bold text-primary">{convertedQuotations}</div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Conversion Rate</span>
            <span className="font-semibold text-lg">{conversionRate.toFixed(1)}%</span>
          </div>
          <Progress value={conversionRate} className="h-3" />
        </div>

        {/* Additional Stats */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Draft</span>
            <span className="font-medium">{quotations.filter(q => q.status === 'draft').length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sent</span>
            <span className="font-medium">{quotations.filter(q => q.status === 'sent').length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Accepted</span>
            <span className="font-medium text-success">{quotations.filter(q => q.status === 'accepted').length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
