
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminJobManagementFiltersProps {
  salesmanFilter: string;
  setSalesmanFilter: (s: string) => void;
  customerFilter: string;
  setCustomerFilter: (c: string) => void;
  branchFilter: string;
  setBranchFilter: (b: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  uniqueSalesmen: string[];
  uniqueCustomers: string[];
  uniqueBranches: string[];
}
export function AdminJobManagementFilters({
  salesmanFilter,
  setSalesmanFilter,
  customerFilter,
  setCustomerFilter,
  branchFilter,
  setBranchFilter,
  statusFilter,
  setStatusFilter,
  uniqueSalesmen,
  uniqueCustomers,
  uniqueBranches,
}: AdminJobManagementFiltersProps) {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label htmlFor="salesmanFilter">Filter by Salesman</Label>
        <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select salesman" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Salesmen</SelectItem>
            {uniqueSalesmen.map((salesman) => (
              <SelectItem key={salesman} value={salesman}>
                {salesman}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerFilter">Filter by Customer</Label>
        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {uniqueCustomers.map((customer) => (
              <SelectItem key={customer} value={customer}>
                {customer}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="branchFilter">Filter by Branch</Label>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {uniqueBranches.map((branch) => (
              <SelectItem key={branch} value={branch}>
                {branch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="statusFilter">Filter by Status</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="designing">Designing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="invoiced">Invoiced</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
