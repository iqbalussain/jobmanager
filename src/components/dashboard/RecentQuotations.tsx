import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuotations } from "@/hooks/useQuotations";
import { formatDistanceToNow } from "date-fns";

export const RecentQuotations = memo(function RecentQuotations() {
  const { quotations, isLoading } = useQuotations();
  const recentQuotations = quotations.slice(0, 7);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted': return 'bg-success/10 text-success';
      case 'accepted': return 'bg-primary/10 text-primary';
      case 'sent': return 'bg-blue-500/10 text-blue-500';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Quotations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Quotations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentQuotations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quotations yet</p>
          ) : (
            recentQuotations.map((quotation) => (
              <div
                key={quotation.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{quotation.quotation_number}</span>
                    <Badge className={getStatusColor(quotation.status)} variant="secondary">
                      {quotation.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {quotation.customer_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(quotation.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">${quotation.total_amount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{quotation.salesman_name}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});
