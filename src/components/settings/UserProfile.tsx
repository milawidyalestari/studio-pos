
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Calendar } from 'lucide-react';

export const UserProfile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    position: 'System Administrator',
    department: 'IT Department',
    bio: 'Experienced system administrator with over 5 years of experience in managing enterprise printing systems.',
    joinDate: '2020-03-15'
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSave = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handlePasswordChange = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    });

    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleProfileChange = (key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordInputChange = (key: string, value: string) => {
    setPasswords(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src="/placeholder.svg" alt="Profile picture" />
          <AvatarFallback className="text-lg">
            {profile.firstName[0]}{profile.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-medium">{profile.firstName} {profile.lastName}</h3>
          <p className="text-muted-foreground">{profile.position}</p>
          <p className="text-sm text-muted-foreground">{profile.department}</p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <h3 className="text-lg font-medium">Personal Information</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input
              id="first-name"
              value={profile.firstName}
              onChange={(e) => handleProfileChange('firstName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              value={profile.lastName}
              onChange={(e) => handleProfileChange('lastName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={profile.position}
              onChange={(e) => handleProfileChange('position', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={profile.department}
              onChange={(e) => handleProfileChange('department', e.target.value)}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleProfileSave}>Save Profile</Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Change Password</h3>
        
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={passwords.newPassword}
              onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
            />
          </div>

          <Button onClick={handlePasswordChange}>Change Password</Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="font-medium">Account Information</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Joined: {new Date(profile.joinDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
