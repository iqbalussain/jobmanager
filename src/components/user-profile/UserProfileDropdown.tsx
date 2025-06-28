
import { useState } from 'react';
import { LogOut, User, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  full_name: string;
  role: string;
}

interface UserProfileDropdownProps {
  userProfile: UserProfile | null;
}

export function UserProfileDropdown({ userProfile }: UserProfileDropdownProps) {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-600 relative"
        >
          <User className="w-5 h-5" />
          {isOpen ? (
            <ChevronUp className="w-3 h-3 absolute -bottom-1 -right-1 bg-white rounded-full" />
          ) : (
            <ChevronDown className="w-3 h-3 absolute -bottom-1 -right-1 bg-white rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-56 p-2">
        <div className="px-2 py-2">
          <p className="font-medium text-sm">{userProfile?.full_name || 'User'}</p>
          <Badge className={`text-xs mt-1 ${getRoleColor(userProfile?.role || 'employee')}`}>
            {userProfile?.role || 'Employee'}
          </Badge>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
