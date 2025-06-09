
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Building2, 
  Palette, 
  Briefcase,
  Plus,
  Trash2,
  Edit
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
}

interface Designer {
  id: string;
  name: string;
  phone: string | null;
}

interface Salesman {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  department: string | null;
  branch: string | null;
  phone: string | null;
}

export function AdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form states
  const [customerForm, setCustomerForm] = useState({ name: "" });
  const [designerForm, setDesignerForm] = useState({ name: "", phone: "" });
  const [salesmanForm, setSalesmanForm] = useState({ name: "", email: "", phone: "" });
  const [userForm, setUserForm] = useState({ 
    email: "", 
    password: "", 
    fullName: "", 
    role: "employee", 
    department: "", 
    branch: "", 
    phone: "" 
  });

  // Fetch data
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Customer[];
    }
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['admin-designers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Designer[];
    }
  });

  const { data: salesmen = [], isLoading: salesmenLoading } = useQuery({
    queryKey: ['admin-salesmen'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salesmen')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Salesman[];
    }
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      if (error) throw error;
      return data as Profile[];
    }
  });

  // Mutations
  const addCustomerMutation = useMutation({
    mutationFn: async (customerData: { name: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setCustomerForm({ name: "" });
      toast({ title: "Customer added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error adding customer", description: error.message, variant: "destructive" });
    }
  });

  const addDesignerMutation = useMutation({
    mutationFn: async (designerData: { name: string; phone: string }) => {
      const { data, error } = await supabase
        .from('designers')
        .insert([designerData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-designers'] });
      queryClient.invalidateQueries({ queryKey: ['designers'] });
      setDesignerForm({ name: "", phone: "" });
      toast({ title: "Designer added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error adding designer", description: error.message, variant: "destructive" });
    }
  });

  const addSalesmanMutation = useMutation({
    mutationFn: async (salesmanData: { name: string; email: string; phone: string }) => {
      const { data, error } = await supabase
        .from('salesmen')
        .insert([salesmanData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-salesmen'] });
      queryClient.invalidateQueries({ queryKey: ['salesmen'] });
      setSalesmanForm({ name: "", email: "", phone: "" });
      toast({ title: "Salesman added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error adding salesman", description: error.message, variant: "destructive" });
    }
  });

  const addUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      // First create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Then create the profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email: userData.email,
            full_name: userData.fullName,
            role: userData.role,
            department: userData.department || null,
            branch: userData.branch || null,
            phone: userData.phone || null
          }]);
        
        if (profileError) throw profileError;

        // Add user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{
            user_id: authData.user.id,
            role: userData.role
          }]);
        
        if (roleError) throw roleError;
      }
      
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      setUserForm({ 
        email: "", 
        password: "", 
        fullName: "", 
        role: "employee", 
        department: "", 
        branch: "", 
        phone: "" 
      });
      toast({ title: "User added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error adding user", description: error.message, variant: "destructive" });
    }
  });

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
          <p className="text-gray-600">Manage customers, salesmen, designers, and users</p>
        </div>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
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
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCustomer} className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ name: e.target.value })}
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={addCustomerMutation.isPending}
                  >
                    {addCustomerMutation.isPending ? "Adding..." : "Add Customer"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Customers</CardTitle>
              </CardHeader>
              <CardContent>
                {customersLoading ? (
                  <p>Loading customers...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Salesmen Tab */}
        <TabsContent value="salesmen">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Salesman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSalesman} className="space-y-4">
                  <div>
                    <Label htmlFor="salesmanName">Name</Label>
                    <Input
                      id="salesmanName"
                      value={salesmanForm.name}
                      onChange={(e) => setSalesmanForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter salesman name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="salesmanEmail">Email</Label>
                    <Input
                      id="salesmanEmail"
                      type="email"
                      value={salesmanForm.email}
                      onChange={(e) => setSalesmanForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salesmanPhone">Phone</Label>
                    <Input
                      id="salesmanPhone"
                      value={salesmanForm.phone}
                      onChange={(e) => setSalesmanForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={addSalesmanMutation.isPending}
                  >
                    {addSalesmanMutation.isPending ? "Adding..." : "Add Salesman"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Salesmen</CardTitle>
              </CardHeader>
              <CardContent>
                {salesmenLoading ? (
                  <p>Loading salesmen...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesmen.map((salesman) => (
                        <TableRow key={salesman.id}>
                          <TableCell className="font-medium">{salesman.name}</TableCell>
                          <TableCell>{salesman.email || 'N/A'}</TableCell>
                          <TableCell>{salesman.phone || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Designers Tab */}
        <TabsContent value="designers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Designer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDesigner} className="space-y-4">
                  <div>
                    <Label htmlFor="designerName">Name</Label>
                    <Input
                      id="designerName"
                      value={designerForm.name}
                      onChange={(e) => setDesignerForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter designer name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="designerPhone">Phone</Label>
                    <Input
                      id="designerPhone"
                      value={designerForm.phone}
                      onChange={(e) => setDesignerForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={addDesignerMutation.isPending}
                  >
                    {addDesignerMutation.isPending ? "Adding..." : "Add Designer"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Designers</CardTitle>
              </CardHeader>
              <CardContent>
                {designersLoading ? (
                  <p>Loading designers...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {designers.map((designer) => (
                        <TableRow key={designer.id}>
                          <TableCell className="font-medium">{designer.name}</TableCell>
                          <TableCell>{designer.phone || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUser} className="space-y-4">
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
                    disabled={addUserMutation.isPending}
                  >
                    {addUserMutation.isPending ? "Adding..." : "Add User"}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
