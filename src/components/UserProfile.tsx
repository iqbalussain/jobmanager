
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, User } from 'lucide-react';

interface UserProfile {
  full_name: string;
  role: string;
  email: string;
  department: string | null;
  branch: string | null;
}

export function UserProfile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'designer': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'salesman': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!profile) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Name</p>
          <p className="font-medium">{profile.full_name || 'Not set'}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Email</p>
          <p className="font-medium">{profile.email}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Role</p>
          <Badge className={getRoleColor(profile.role)}>
            {profile.role}
          </Badge>
        </div>
        
        {profile.department && (
          <div>
            <p className="text-sm text-gray-600">Department</p>
            <p className="font-medium">{profile.department}</p>
          </div>
        )}
        
        {profile.branch && (
          <div>
            <p className="text-sm text-gray-600">Branch</p>
            <p className="font-medium">{profile.branch}</p>
          </div>
        )}
        
        <Button
          onClick={signOut}
          variant="outline"
          className="w-full mt-4 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}
