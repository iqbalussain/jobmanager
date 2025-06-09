
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddUser} className="space-y-4">
            <div>
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <Label htmlFor="userPassword">Password</Label>
              <Input
                id="userPassword"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
                required
              />
            </div>
            <div>
              <Label htmlFor="userFullName">Full Name</Label>
              <Input
                id="userFullName"
                value={userForm.fullName}
                onChange={(e) => setUserForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="userRole">Role</Label>
              <Select value={userForm.role} onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
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
            <div>
              <Label htmlFor="userDepartment">Department</Label>
              <Input
                id="userDepartment"
                value={userForm.department}
                onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Enter department"
              />
            </div>
            <div>
              <Label htmlFor="userBranch">Branch</Label>
              <Input
                id="userBranch"
                value={userForm.branch}
                onChange={(e) => setUserForm(prev => ({ ...prev, branch: e.target.value }))}
                placeholder="Enter branch"
              />
            </div>
            <div>
              <Label htmlFor="userPhone">Phone</Label>
              <Input
                id="userPhone"
                value={userForm.phone}
                onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isAdding}
            >
              {isAdding ? "Adding..." : "Add User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Users</CardTitle>
        </CardHeader>
        <CardContent>
          {profilesLoading ? (
            <p>Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name || 'N/A'}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{profile.role}</Badge>
                    </TableCell>
                    <TableCell>{profile.department || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
