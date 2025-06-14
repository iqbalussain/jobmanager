import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  User, 
  Shield, 
  Palette, 
  Database,
  Download,
  Upload,
  Trash2,
  Save
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Helpers for theme
const PALETTES = [
  {
    key: "neon",
    name: "Neon Highlights",
    colors: [
      { bg: "#00FF85" }, // lime green
      { bg: "#1E90FF" }, // electric blue
      { bg: "#FF0099" }, // hot pink
    ]
  },
  {
    key: "jewel",
    name: "Deep Jewel Tones",
    colors: [
      { bg: "#004D61" }, // teal
      { bg: "#B39CD0" }, // lavender
      { bg: "#3E5641" }, // green
    ]
  }
];

// Util: update theme on <body>
function updateTheme({ dark, palette }: { dark: boolean, palette: string }) {
  if (dark) {
    document.body.classList.add("dark");
    document.body.classList.remove("palette-neon", "palette-jewel");
    if (palette === "neon") {
      document.body.classList.add("palette-neon");
    } else {
      document.body.classList.add("palette-jewel");
    }
  } else {
    document.body.classList.remove("dark", "palette-neon", "palette-jewel");
  }
  // persist
  localStorage.setItem("themeDark", dark ? "1" : "0");
  localStorage.setItem("themePalette", palette);
}

export function SettingsView() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("themeDark") === "1");
  const [colorPalette, setColorPalette] = useState(() => localStorage.getItem("themePalette") || "neon");
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    branch: '',
    department: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Update theme instantly when toggled
  useEffect(() => {
    updateTheme({ dark: darkMode, palette: colorPalette });
  }, [darkMode, colorPalette]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          fullName: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          branch: data.branch || '',
          department: data.department || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
          phone: profileData.phone,
          branch: profileData.branch,
          department: profileData.department,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data, error } = await supabase
        .from('job_orders')
        .select('*')
        .csv();

      if (error) throw error;

      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'job_orders_export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={profileData.fullName}
                onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                placeholder="Enter your full name" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={profileData.email}
                disabled
                placeholder="Email cannot be changed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                placeholder="Enter your phone number" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input 
                id="branch" 
                value={profileData.branch}
                onChange={(e) => setProfileData({...profileData, branch: e.target.value})}
                placeholder="Enter your branch" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input 
                id="department" 
                value={profileData.department}
                onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                placeholder="Enter your department" 
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleProfileUpdate}
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive notifications about job updates
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Updates</Label>
                <p className="text-sm text-gray-500">
                  Receive email summaries of daily activities
                </p>
              </div>
              <Switch
                checked={emailUpdates}
                onCheckedChange={setEmailUpdates}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Switch to dark theme
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={val => setDarkMode(val)}
              />
            </div>
            <Separator />
            <div>
              <Label>Theme Color Palette</Label>
              <div className="flex gap-2 mt-2">
                {PALETTES.map(pal => (
                  <button
                    key={pal.key}
                    onClick={() => setColorPalette(pal.key)}
                    className={`flex flex-col items-center transition focus:outline-none border-2 rounded-xl px-2 py-1
                      ${colorPalette === pal.key ? "border-primary" : "border-transparent"}
                      bg-transparent hover:border-gray-300 dark:hover:border-gray-500`}
                    type="button"
                  >
                    <div className="flex gap-1 mb-1">
                      {pal.colors.map((c, i) =>
                        <span key={i} className="w-6 h-6 rounded-full border-2 border-white" style={{ background: c.bg }}></span>
                      )}
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-200">{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" className="w-full" disabled>
              <Upload className="w-4 h-4 mr-2" />
              Import Data (Coming Soon)
            </Button>
            <Separator />
            <Button variant="destructive" className="w-full" disabled>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data (Admin Only)
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" disabled>Change Password (Coming Soon)</Button>
              <Button variant="outline" disabled>Two-Factor Authentication (Coming Soon)</Button>
              <Button variant="outline" disabled>Login History (Coming Soon)</Button>
              <Button variant="outline" disabled>Privacy Settings (Coming Soon)</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
