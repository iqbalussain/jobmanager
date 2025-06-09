
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Building2, 
  Palette, 
  Briefcase,
  UserPlus,
  FileText
} from "lucide-react";
import { useAdminManagement } from "@/hooks/useAdminManagement";
import { CustomerManagement } from "@/components/admin/CustomerManagement";
import { SalesmanManagement } from "@/components/admin/SalesmanManagement";
import { DesignerManagement } from "@/components/admin/DesignerManagement";
import { JobTitleManagement } from "@/components/admin/JobTitleManagement";
import { UserManagement } from "@/components/admin/UserManagement";

export function AdminManagement() {
  const {
    // Data
    customers,
    designers,
    salesmen,
    jobTitles,
    profiles,
    
    // Loading states
    customersLoading,
    designersLoading,
    salesmenLoading,
    jobTitlesLoading,
    profilesLoading,
    
    // Form states
    customerForm,
    setCustomerForm,
    designerForm,
    setDesignerForm,
    salesmanForm,
    setSalesmanForm,
    jobTitleForm,
    setJobTitleForm,
    userForm,
    setUserForm,
    
    // Mutations
    addCustomerMutation,
    addDesignerMutation,
    addSalesmanMutation,
    addJobTitleMutation,
    addUserMutation
  } = useAdminManagement();

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerForm.name.trim()) {
      addCustomerMutation.mutate({ name: customerForm.name.trim() });
    }
  };

  const handleAddDesigner = (e: React.FormEvent) => {
    e.preventDefault();
    if (designerForm.name.trim()) {
      addDesignerMutation.mutate({
        name: designerForm.name.trim(),
        phone: designerForm.phone.trim() || ""
      });
    }
  };

  const handleAddSalesman = (e: React.FormEvent) => {
    e.preventDefault();
    if (salesmanForm.name.trim()) {
      addSalesmanMutation.mutate({
        name: salesmanForm.name.trim(),
        email: salesmanForm.email.trim() || "",
        phone: salesmanForm.phone.trim() || ""
      });
    }
  };

  const handleAddJobTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobTitleForm.title.trim()) {
      addJobTitleMutation.mutate({
        job_title_id: jobTitleForm.title.trim()
      });
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.email.trim() && userForm.password.trim() && userForm.fullName.trim()) {
      addUserMutation.mutate(userForm);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Admin Management
          </h1>
          <p className="text-gray-600">Manage customers, salesmen, designers, job titles, and users</p>
        </div>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="salesmen" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Salesmen
          </TabsTrigger>
          <TabsTrigger value="designers" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Designers
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
            customers={customers}
            customersLoading={customersLoading}
            customerForm={customerForm}
            setCustomerForm={setCustomerForm}
            onAddCustomer={handleAddCustomer}
            isAdding={addCustomerMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="salesmen">
          <SalesmanManagement
            salesmen={salesmen}
            salesmenLoading={salesmenLoading}
            salesmanForm={salesmanForm}
            setSalesmanForm={setSalesmanForm}
            onAddSalesman={handleAddSalesman}
            isAdding={addSalesmanMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="designers">
          <DesignerManagement
            designers={designers}
            designersLoading={designersLoading}
            designerForm={designerForm}
            setDesignerForm={setDesignerForm}
            onAddDesigner={handleAddDesigner}
            isAdding={addDesignerMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="job-titles">
          <JobTitleManagement
            jobTitles={jobTitles}
            jobTitlesLoading={jobTitlesLoading}
            jobTitleForm={jobTitleForm}
            setJobTitleForm={setJobTitleForm}
            onAddJobTitle={handleAddJobTitle}
            isAdding={addJobTitleMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement
            profiles={profiles}
            profilesLoading={profilesLoading}
            userForm={userForm}
            setUserForm={setUserForm}
            onAddUser={handleAddUser}
            isAdding={addUserMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
