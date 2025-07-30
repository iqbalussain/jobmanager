import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useJobOrders } from "@/hooks/useJobOrders";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JobStatus } from "@/types/jobOrder";

const PAGE_SIZE = 50;

export function DeliveryRecord() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const { jobOrders, isLoading } = useJobOrders();
  const { toast } = useToast();

  const filteredJobs = useMemo(() => {
    return jobOrders.filter(job => {
      return job.job_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
             job.job_order_details?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [jobOrders, searchTerm]);

  const paginatedJobs = useMemo(() => {
    return filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filteredJobs, page]);

  useEffect(() => {
    const newTotalPages = Math.ceil(filteredJobs.length / PAGE_SIZE) || 1;
    setTotalPages(newTotalPages);
    if (page > newTotalPages) setPage(1);
  }, [filteredJobs]);

  const handleSelectJob = async (jobId: string) => {
    const { data, error } = await supabase
      .from('job_orders')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
      return;
    }

    setSelectedJob(data);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <div>
        <Input
          placeholder="Search by order number or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Title</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedJobs.map((job) => (
              <TableRow key={job.id} onClick={() => handleSelectJob(job.id)} className="cursor-pointer">
                <TableCell>{job.job_order_number}</TableCell>
                <TableCell>{job.job_order_details || `Job ${job.job_order_number}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-between mt-4">
          <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span>Page {page} of {totalPages}</span>
          <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

      <div>
        {selectedJob ? (
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Order #:</strong> {selectedJob.job_order_number}</p>
              <p><strong>Title:</strong> {selectedJob.job_order_details}</p>
              <p><strong>Status:</strong> {selectedJob.status}</p>
              <p><strong>Salesman:</strong> {selectedJob.salesman?.name || "Unassigned"}</p>
              <p><strong>Created At:</strong> {new Date(selectedJob.created_at).toLocaleString()}</p>
            </CardContent>
          </Card>
        ) : (
          <p className="text-gray-500">Click a job to view details</p>
        )}
      </div>
    </div>
  );
}
