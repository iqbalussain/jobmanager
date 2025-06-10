
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Building2, 
  UserPlus,
  FileText
} from "lucide-react";
import { useCustomerManagement } from "@/hooks/useCustomerManagement";
import { useJobTitleManagement } from "@/hooks/useJobTitleManagement";
import { useUserManagement } from "@/hooks/useUserManagement";
import { CustomerManagement } from "@/components/admin/CustomerManagement";
import { JobTitleManagement } from "@/components/admin/JobTitleManagement";
import { UserManagement } from "@/components/admin/UserManagement";

export function AdminManagement() {
  const customerHook = useCustomerManagement();
  const jobTitleHook = useJobTitleManagement();
  const userHook = useUserManagement();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Admin Management
          </h1>
          <p className="text-gray-600">Manage customers, job titles, and users</p>
        </div>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="job-titles" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Job Titles
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <CustomerManagement
            customers={customerHook.customers}
            customersLoading={customerHook.customersLoading}
            customerForm={customerHook.customerForm}
            setCustomerForm={customerHook.setCustomerForm}
            onAddCustomer={customerHook.handleAddCustomer}
            isAdding={customerHook.addCustomerMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="job-titles">
          <JobTitleManagement
            jobTitles={jobTitleHook.jobTitles}
            jobTitlesLoading={jobTitleHook.jobTitlesLoading}
            jobTitleForm={jobTitleHook.jobTitleForm}
            setJobTitleForm={jobTitleHook.setJobTitleForm}
            onAddJobTitle={jobTitleHook.handleAddJobTitle}
            isAdding={jobTitleHook.addJobTitleMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement
            profiles={userHook.profiles}
            profilesLoading={userHook.profilesLoading}
            userForm={userHook.userForm}
            setUserForm={userHook.setUserForm}
            onAddUser={userHook.handleAddUser}
            isAdding={userHook.addUserMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
