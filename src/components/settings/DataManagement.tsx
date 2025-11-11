import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DataType = 'job_orders' | 'customers' | 'job_titles' | 'profiles' | 'designers' | 'salesmen';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function DataManagement() {
  const [exportType, setExportType] = useState<DataType>('job_orders');
  const [importType, setImportType] = useState<DataType>('customers');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      let data, error;
      
      // Handle different table exports
      if (exportType === 'designers') {
        const result = await supabase.from('profiles').select('*').eq('role', 'designer').csv();
        data = result.data;
        error = result.error;
      } else if (exportType === 'salesmen') {
        const result = await supabase.from('profiles').select('*').eq('role', 'salesman').csv();
        data = result.data;
        error = result.error;
      } else if (exportType === 'job_orders') {
        const result = await supabase.from('job_orders').select('*').csv();
        data = result.data;
        error = result.error;
      } else if (exportType === 'customers') {
        const result = await supabase.from('customers').select('*').csv();
        data = result.data;
        error = result.error;
      } else if (exportType === 'job_titles') {
        const result = await supabase.from('job_titles').select('*').csv();
        data = result.data;
        error = result.error;
      } else if (exportType === 'profiles') {
        const result = await supabase.from('profiles').select('*').csv();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${exportType}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: `${exportType} data exported successfully`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        throw new Error('CSV file must contain headers and at least one data row');
      }

      const headers = rows[0].map(h => h.toLowerCase().trim());
      const dataRows = rows.slice(1);

      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        try {
          const record = headers.reduce((obj, header, index) => {
            obj[header] = row[index]?.replace(/^"|"$/g, '').trim() || null;
            return obj;
          }, {} as Record<string, any>);

          // Validate required fields based on import type
          if (importType === 'customers' && !record.name) {
            throw new Error('Missing required field: name');
          }
          if (importType === 'job_titles' && !record.job_title_id) {
            throw new Error('Missing required field: job_title_id');
          }

          // Insert data based on type
          let error;
          
          if (importType === 'customers') {
            const result = await supabase
              .from('customers')
              .insert({ name: record.name });
            error = result.error;
          } else if (importType === 'job_titles') {
            const result = await supabase
              .from('job_titles')
              .insert({ job_title_id: record.job_title_id });
            error = result.error;
          }

          if (error) throw error;
          result.success++;
        } catch (error) {
          result.failed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Row ${i + 2}: ${errorMsg}`);
        }
      }

      setImportResult(result);

      if (result.success > 0) {
        toast({
          title: "Import completed",
          description: `Successfully imported ${result.success} record(s)${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        });
      } else {
        toast({
          title: "Import failed",
          description: "No records were imported",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const getDataTypeLabel = (type: DataType): string => {
    const labels: Record<DataType, string> = {
      job_orders: 'Job Orders',
      customers: 'Customers',
      job_titles: 'Job Titles',
      profiles: 'User Profiles',
      designers: 'Designers',
      salesmen: 'Salesmen'
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Export Data</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Export your data to CSV format for backup or analysis
        </p>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="export-type">Select data type</Label>
            <Select value={exportType} onValueChange={(value) => setExportType(value as DataType)}>
              <SelectTrigger id="export-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job_orders">Job Orders</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
                <SelectItem value="job_titles">Job Titles</SelectItem>
                <SelectItem value="profiles">User Profiles</SelectItem>
                <SelectItem value="designers">Designers</SelectItem>
                <SelectItem value="salesmen">Salesmen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleExportData} 
            disabled={isExporting}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : `Export ${getDataTypeLabel(exportType)}`}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Import Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Import Data</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Import data from CSV files. Make sure your CSV has the correct column headers.
        </p>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Required CSV format:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• <strong>Customers:</strong> name</li>
              <li>• <strong>Job Titles:</strong> job_title_id</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="import-type">Select data type</Label>
            <Select value={importType} onValueChange={(value) => setImportType(value as DataType)}>
              <SelectTrigger id="import-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customers">Customers</SelectItem>
                <SelectItem value="job_titles">Job Titles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-file">Choose CSV file</Label>
            <input
              id="import-file"
              type="file"
              accept=".csv"
              onChange={handleImportData}
              disabled={isImporting}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {isImporting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4 animate-pulse" />
              Importing data...
            </div>
          )}

          {importResult && (
            <Alert variant={importResult.failed > 0 ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Import Results:</p>
                  <p>✓ Successfully imported: {importResult.success}</p>
                  {importResult.failed > 0 && (
                    <>
                      <p>✗ Failed: {importResult.failed}</p>
                      {importResult.errors.length > 0 && (
                        <div className="mt-2 space-y-1 text-xs max-h-40 overflow-y-auto">
                          <p className="font-semibold">Errors:</p>
                          {importResult.errors.slice(0, 10).map((error, i) => (
                            <p key={i}>• {error}</p>
                          ))}
                          {importResult.errors.length > 10 && (
                            <p>... and {importResult.errors.length - 10} more errors</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
