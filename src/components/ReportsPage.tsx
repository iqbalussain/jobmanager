
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Download, 
  DollarSign,
  TrendingUp,
  FileText,
  AlertCircle
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface ReportData {
  customerName: string;
  salesmanName: string;
  totalJobs: number;
  completedJobs: number;
  totalValue: number;
  averageCompletionTime: number;
  branch: string;
}

export function ReportsPage() {
  const [reportType, setReportType] = useState<"customer" | "salesman" | "branch">("customer");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalJobs: 0,
    completionRate: 0,
    averageJobValue: 0
  });
  const { toast } = useToast();

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const selectedDate = new Date(selectedMonth + '-01');
      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(selectedDate);

      console.log('Generating report for:', { startDate, endDate, reportType });

      // Updated query to use the foreign key relationships
      const { data: jobOrders, error } = await supabase
        .from('job_orders')
        .select(`
          *,
          customers!fk_job_orders_customer(name),
          salesman_profiles:profiles!fk_job_orders_salesman(full_name),
          designer_profiles:profiles!fk_job_orders_designer(full_name)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Retrieved job orders:', jobOrders?.length || 0);

      if (!jobOrders || jobOrders.length === 0) {
        setReportData([]);
        setSummaryStats({
          totalRevenue: 0,
          totalJobs: 0,
          completionRate: 0,
          averageJobValue: 0
        });
        return;
      }

      // Process data based on report type
      const processedData = processReportData(jobOrders, reportType);
      setReportData(processedData);

      // Calculate summary statistics
      const totalRevenue = jobOrders.reduce((sum, job) => sum + (job.total_value || 0), 0);
      const totalJobs = jobOrders.length;
      const completedJobs = jobOrders.filter(job => 
        job.status === 'completed' || job.status === 'invoiced'
      ).length;
      const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
      const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;

      setSummaryStats({
        totalRevenue,
        totalJobs,
        completionRate,
        averageJobValue
      });

      toast({
        title: "Success",
        description: `Report generated successfully with ${totalJobs} jobs.`,
      });

    } catch (error) {
      console.error('Error generating report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to generate report: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processReportData = (jobs: any[], type: string): ReportData[] => {
    const groupedData: { [key: string]: any } = {};

    jobs.forEach(job => {
      let groupKey = '';
      let groupName = '';

      try {
        switch (type) {
          case 'customer':
            groupKey = job.customers?.name || 'Unknown Customer';
            groupName = groupKey;
            break;
          case 'salesman':
            groupKey = job.salesman_profiles?.full_name || 'Unassigned';
            groupName = groupKey;
            break;
          case 'branch':
            groupKey = job.branch || 'Unknown Branch';
            groupName = groupKey;
            break;
          default:
            groupKey = 'Unknown';
            groupName = 'Unknown';
        }

        if (!groupedData[groupKey]) {
          groupedData[groupKey] = {
            name: groupName,
            totalJobs: 0,
            completedJobs: 0,
            totalValue: 0,
            jobs: [],
            branch: job.branch || 'N/A'
          };
        }

        groupedData[groupKey].totalJobs++;
        groupedData[groupKey].totalValue += Number(job.total_value || 0);
        groupedData[groupKey].jobs.push(job);
        
        if (job.status === 'completed' || job.status === 'invoiced') {
          groupedData[groupKey].completedJobs++;
        }
      } catch (error) {
        console.error('Error processing job:', job, error);
      }
    });

    return Object.values(groupedData).map((group: any) => ({
      customerName: type === 'customer' ? group.name : '',
      salesmanName: type === 'salesman' ? group.name : '',
      totalJobs: group.totalJobs,
      completedJobs: group.completedJobs,
      totalValue: group.totalValue,
      averageCompletionTime: 0,
      branch: group.branch
    }));
  };

  const exportReport = () => {
    try {
      const csvContent = generateCSVContent();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportType}_report_${selectedMonth}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Report exported successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export report.",
        variant: "destructive",
      });
    }
  };

  const generateCSVContent = () => {
    const headers = [
      reportType === 'customer' ? 'Customer Name' : reportType === 'salesman' ? 'Salesman Name' : 'Branch Name',
      'Total Jobs',
      'Completed Jobs',
      'Completion Rate (%)',
      'Total Value (R.O)',
      'Average Job Value (R.O)'
    ];

    const rows = reportData.map(row => [
      reportType === 'customer' ? row.customerName : 
      reportType === 'salesman' ? row.salesmanName : row.branch,
      row.totalJobs,
      row.completedJobs,
      row.totalJobs > 0 ? ((row.completedJobs / row.totalJobs) * 100).toFixed(1) : '0.0',
      row.totalValue.toFixed(2),
      row.totalJobs > 0 ? (row.totalValue / row.totalJobs).toFixed(2) : '0.00'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  useEffect(() => {
    generateReport();
  }, [reportType, selectedMonth]);

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Generate detailed reports and analyze business performance</p>
          </div>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center p-6">
            <AlertCircle className="h-8 w-8 text-red-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Report Generation Failed</h3>
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={generateReport} 
                className="mt-2"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Generate detailed reports and analyze business performance</p>
        </div>
        <Button onClick={exportReport} className="flex items-center gap-2" disabled={reportData.length === 0}>
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer-wise Report</SelectItem>
                  <SelectItem value="salesman">Salesman-wise Report</SelectItem>
                  <SelectItem value="branch">Branch-wise Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="month">Select Month</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} disabled={isLoading} className="w-full">
                {isLoading ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">${summaryStats.totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold">{summaryStats.totalJobs}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold">{summaryStats.completionRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Job Value</p>
              <p className="text-2xl font-bold">${summaryStats.averageJobValue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{reportType} Performance Report</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2">Loading report data...</span>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No data available for the selected period.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {reportType === 'customer' ? 'Customer Name' : 
                     reportType === 'salesman' ? 'Salesman Name' : 'Branch Name'}
                  </TableHead>
                  <TableHead>Total Jobs</TableHead>
                  <TableHead>Completed Jobs</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Average Job Value</TableHead>
                  {reportType !== 'branch' && <TableHead>Branch</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((row, index) => {
                  const completionRate = row.totalJobs > 0 ? (row.completedJobs / row.totalJobs) * 100 : 0;
                  const avgJobValue = row.totalJobs > 0 ? row.totalValue / row.totalJobs : 0;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {reportType === 'customer' ? row.customerName : 
                         reportType === 'salesman' ? row.salesmanName : row.branch}
                      </TableCell>
                      <TableCell>{row.totalJobs}</TableCell>
                      <TableCell>{row.completedJobs}</TableCell>
                      <TableCell>
                        <Badge variant={completionRate >= 80 ? "default" : completionRate >= 60 ? "secondary" : "destructive"}>
                          {completionRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">${row.totalValue.toFixed(2)}</TableCell>
                      <TableCell>${avgJobValue.toFixed(2)}</TableCell>
                      {reportType !== 'branch' && <TableCell>{row.branch}</TableCell>}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
