
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, User } from 'lucide-react';

export const UserSettings = () => {
  const { toast } = useToast();
  const [users] = useState([
    { id: 1, name: 'Admin User', email: 'admin@company.com', role: 'Administrator', status: 'Active' },
    { id: 2, name: 'John Manager', email: 'john@company.com', role: 'Manager', status: 'Active' },
    { id: 3, name: 'Jane Cashier', email: 'jane@company.com', role: 'Cashier', status: 'Inactive' },
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    sendWelcomeEmail: true
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "User added",
      description: `User ${newUser.name} has been added successfully.`,
    });

    setNewUser({
      name: '',
      email: '',
      role: '',
      password: '',
      sendWelcomeEmail: true
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Administrator': return 'destructive';
      case 'Manager': return 'default';
      case 'Cashier': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <h3 className="text-lg font-medium">Add New User</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Full Name *</Label>
            <Input
              id="user-name"
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">Email Address *</Label>
            <Input
              id="user-email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-role">Role *</Label>
            <Select
              value={newUser.role}
              onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrator">Administrator</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Cashier">Cashier</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">Temporary Password</Label>
            <Input
              id="user-password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Auto-generated if empty"
            />
          </div>

          <div className="col-span-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="welcome-email"
                checked={newUser.sendWelcomeEmail}
                onCheckedChange={(checked) => setNewUser(prev => ({ ...prev, sendWelcomeEmail: checked }))}
              />
              <Label htmlFor="welcome-email">Send welcome email with login credentials</Label>
            </div>
          </div>
        </div>

        <Button onClick={handleAddUser} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Existing Users</h3>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast({
                        title: "Edit user",
                        description: `Editing ${user.name}`,
                      })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast({
                        title: "User deleted",
                        description: `${user.name} has been removed.`,
                      })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
