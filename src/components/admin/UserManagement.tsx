import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, User, Mail, Phone, Building, Shield, UserX, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/hooks/useUserManagement";

interface UserManagementProps {
  profiles: Profile[];
  profilesLoading: boolean;
  userForm: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    department: string;
    branch: string;
    phone: string;
  };
  setUserForm: (form: any) => void;
  onAddUser: (e: React.FormEvent) => void;
  isAdding: boolean;
}

export function UserManagement({
  profiles,
  profilesLoading,
  userForm,
  setUserForm,
  onAddUser,
  isAdding
}: UserManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setTogglingStatus(userId);
    
    try {
      const { error } = await supabase.functions.invoke('toggle-user-status', {
        body: {
          userId: userId,
          isActive: !currentStatus
        }
      });

      if (error) throw error;

      toast({
        title: !currentStatus ? "User Activated" : "User Deactivated",
        description: `User has been successfully ${!currentStatus ? 'activated' : 'deactivated'}`
      });

      // Refresh profiles
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive"
      });
    } finally {
      setTogglingStatus(null);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800 border-red-200";
      case "manager": return "bg-blue-100 text-blue-800 border-blue-200";
      case "designer": return "bg-purple-100 text-purple-800 border-purple-200";
      case "salesman": return "bg-green-100 text-green-800 border-green-200";
      case "job_order_manager": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Add New User Form */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            Add New User
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={onAddUser} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userEmail" className="flex items-center gap-2 font-medium">
                  <Mail className="w-4 h-4 text-gray-500" />
                  Email Address
                </Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  className="bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userPassword" className="flex items-center gap-2 font-medium">
                  <Shield className="w-4 h-4 text-gray-500" />
                  Password
                </Label>
                <Input
                  id="userPassword"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter secure password"
                  className="bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userFullName" className="flex items-center gap-2 font-medium">
                  <User className="w-4 h-4 text-gray-500" />
                  Full Name
                </Label>
                <Input
                  id="userFullName"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter full name"
                  className="bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userRole" className="font-medium">User Role</Label>
                <Select value={userForm.role} onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-indigo-500">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="salesman">Salesman</SelectItem>
                    <SelectItem value="job_order_manager">Job Order Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userDepartment" className="flex items-center gap-2 font-medium">
                    <Building className="w-4 h-4 text-gray-500" />
                    Department
                  </Label>
                  <Input
                    id="userDepartment"
                    value={userForm.department}
                    onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter department"
                    className="bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userBranch" className="font-medium">Branch</Label>
                  <Input
                    id="userBranch"
                    value={userForm.branch}
                    onChange={(e) => setUserForm(prev => ({ ...prev, branch: e.target.value }))}
                    placeholder="Enter branch"
                    className="bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userPhone" className="flex items-center gap-2 font-medium">
                  <Phone className="w-4 h-4 text-gray-500" />
                  Phone Number
                </Label>
                <Input
                  id="userPhone"
                  value={userForm.phone}
                  onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3 shadow-lg"
              disabled={isAdding}
            >
              {isAdding ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating User...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create User Account
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Users Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            Existing Users ({profiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {profilesLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead className="font-semibold text-gray-900">Name</TableHead>
                    <TableHead className="font-semibold text-gray-900">Email</TableHead>
                    <TableHead className="font-semibold text-gray-900">Role</TableHead>
                    <TableHead className="font-semibold text-gray-900">Department</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id} className="hover:bg-white/50 transition-colors">
                      <TableCell className="font-medium flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {profile.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        {profile.full_name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {profile.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getRoleBadgeStyle(profile.role)} border-2 font-medium`}
                        >
                          {profile.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          {profile.department || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={profile.is_active !== false}
                            onCheckedChange={() => handleToggleUserStatus(profile.id, profile.is_active !== false)}
                            disabled={togglingStatus === profile.id}
                          />
                          <Badge 
                            variant="outline"
                            className={profile.is_active !== false 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : "bg-gray-100 text-gray-800 border-gray-200"}
                          >
                            {profile.is_active !== false ? (
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <UserX className="w-3 h-3" />
                                Inactive
                              </span>
                            )}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
