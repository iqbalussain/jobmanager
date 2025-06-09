
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching profile for user:', user.id);
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        
        // If profile doesn't exist, create one with basic info
        if (fetchError.code === 'PGRST116') {
          console.log('Profile not found, creating one...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || 'User',
              role: 'user',
              department: null,
              branch: null
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating profile:', createError);
            setError('Failed to create user profile');
          } else {
            console.log('Profile created:', newProfile);
            setProfile(newProfile);
          }
        } else {
          setError('Failed to load user profile');
        }
      } else {
        console.log('Profile loaded:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="text-sm text-gray-600">Loading profile...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button onClick={fetchProfile} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">No profile found</p>
            <Button onClick={fetchProfile} variant="outline" size="sm">
              Create Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
