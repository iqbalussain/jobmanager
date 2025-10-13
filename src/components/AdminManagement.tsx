
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Building2, 
  UserPlus,
  FileText,
  Sparkles,
  Crown,
  MessageSquare
} from "lucide-react";
import { useCustomerManagement } from "@/hooks/useCustomerManagement";
import { useJobTitleManagement } from "@/hooks/useJobTitleManagement";
import { useUserManagement } from "@/hooks/useUserManagement";
import { CustomerManagement } from "@/components/admin/CustomerManagement";
import { JobTitleManagement } from "@/components/admin/JobTitleManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { AdvancedUserPermissions } from "@/components/admin/AdvancedUserPermissions";
import { CommunicationsManagement } from "@/components/CommunicationsManagement";

export function AdminManagement() {
  const customerHook = useCustomerManagement();
  const jobTitleHook = useJobTitleManagement();
  const userHook = useUserManagement();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              Admin Management
            </h1>
            <p className="text-gray-600 text-lg">Manage customers, job titles, and users with powerful admin tools</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl border-0 shadow-lg">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Enhanced Admin Panel</span>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border-0 shadow-xl overflow-hidden">
          <Tabs defaultValue="customers" className="w-full">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1">
              <TabsList className="grid w-full grid-cols-5 bg-white/20 backdrop-blur-sm rounded-xl border-0 p-1">
                <TabsTrigger 
                  value="customers" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg text-white/90 font-medium transition-all duration-200"
                >
                  <Building2 className="w-4 h-4" />
                  Customers
                </TabsTrigger>
                <TabsTrigger 
                  value="job-titles" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg text-white/90 font-medium transition-all duration-200"
                >
                  <FileText className="w-4 h-4" />
                  Job Titles
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg text-white/90 font-medium transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="permissions" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg text-white/90 font-medium transition-all duration-200"
                >
                  <Crown className="w-4 h-4" />
                  Access Control
                </TabsTrigger>
                <TabsTrigger 
                  value="communications" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg text-white/90 font-medium transition-all duration-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  Communications
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
              <TabsContent value="customers" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
                      <p className="text-gray-600">Add, edit, and manage customer information</p>
                    </div>
                  </div>
                  <CustomerManagement
                    customers={customerHook.customers}
                    customersLoading={customerHook.customersLoading}
                    customerForm={customerHook.customerForm}
                    setCustomerForm={customerHook.setCustomerForm}
                    onAddCustomer={customerHook.handleAddCustomer}
                    isAdding={customerHook.addCustomerMutation.isPending}
                  />
                </div>
              </TabsContent>

              <TabsContent value="job-titles" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Job Title Management</h2>
                      <p className="text-gray-600">Define and organize job titles for projects</p>
                    </div>
                  </div>
                  <JobTitleManagement
                    jobTitles={jobTitleHook.jobTitles}
                    jobTitlesLoading={jobTitleHook.jobTitlesLoading}
                    jobTitleForm={jobTitleHook.jobTitleForm}
                    setJobTitleForm={jobTitleHook.setJobTitleForm}
                    onAddJobTitle={jobTitleHook.handleAddJobTitle}
                    isAdding={jobTitleHook.addJobTitleMutation.isPending}
                  />
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                      <p className="text-gray-600">Create and manage user accounts and permissions</p>
                    </div>
                  </div>
                  <UserManagement
                    profiles={userHook.profiles}
                    profilesLoading={userHook.profilesLoading}
                    userForm={userHook.userForm}
                    setUserForm={userHook.setUserForm}
                    onAddUser={userHook.handleAddUser}
                    isAdding={userHook.addUserMutation.isPending}
                  />
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Advanced Access Control</h2>
                      <p className="text-gray-600">Granular permission management and user access control</p>
                    </div>
                  </div>
                  <AdvancedUserPermissions />
                </div>
              </TabsContent>

              <TabsContent value="communications" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Communications Management</h2>
                      <p className="text-gray-600">Manage email recipients, logs, and communication settings</p>
                    </div>
                  </div>
                  <CommunicationsManagement />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
