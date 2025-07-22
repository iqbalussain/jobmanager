import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit, Mail } from 'lucide-react';
import { useEmailRecipients, type EmailRecipient } from '@/hooks/useEmailManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const EMAIL_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'approvals', label: 'Approvals' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'alerts', label: 'Alerts' },
  { value: 'reports', label: 'Reports' },
];

export function EmailRecipientsSection() {
  const { recipients, isLoading, addRecipient, updateRecipient, deleteRecipient, isAddingRecipient } = useEmailRecipients();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRecipient, setNewRecipient] = useState({
    email_address: '',
    name: '',
    category: 'general',
    is_active: true,
  });

  const handleAddRecipient = () => {
    if (!newRecipient.email_address.trim()) return;
    
    addRecipient(newRecipient);
    setNewRecipient({
      email_address: '',
      name: '',
      category: 'general',
      is_active: true,
    });
    setIsAddDialogOpen(false);
  };

  const toggleRecipientStatus = (recipient: EmailRecipient) => {
    updateRecipient({
      id: recipient.id,
      updates: { is_active: !recipient.is_active }
    });
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'approvals': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'notifications': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'alerts': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'reports': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading email recipients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Email Recipients</h3>
          <p className="text-sm text-muted-foreground">
            Manage email addresses that will receive notifications
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Recipient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Email Recipient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newRecipient.email_address}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, email_address: e.target.value }))}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  value={newRecipient.name}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newRecipient.category} 
                  onValueChange={(value) => setNewRecipient(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newRecipient.is_active}
                  onCheckedChange={(checked) => setNewRecipient(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRecipient} disabled={isAddingRecipient}>
                  {isAddingRecipient ? 'Adding...' : 'Add Recipient'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {recipients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Email Recipients</h3>
            <p className="text-muted-foreground mb-4">
              Add email recipients to start sending notifications
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.map((recipient) => (
                  <TableRow key={recipient.id}>
                    <TableCell className="font-medium">
                      {recipient.email_address}
                    </TableCell>
                    <TableCell>
                      {recipient.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryBadgeColor(recipient.category)}>
                        {recipient.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={recipient.is_active}
                        onCheckedChange={() => toggleRecipientStatus(recipient)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(recipient.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRecipient(recipient.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}