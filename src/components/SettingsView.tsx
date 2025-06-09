
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  User, 
  Shield, 
  Palette, 
  Database,
  Download,
  Upload,
  Trash2
} from "lucide-react";
import { useState } from "react";

export function SettingsView() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your application preferences</p>
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
              <Input id="fullName" placeholder="Enter your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="Enter your phone number" />
            </div>
            <Button className="w-full">Update Profile</Button>
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
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-gray-500">
                  Switch to dark theme
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Theme Color</Label>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 cursor-pointer border-2 border-blue-600"></div>
                <div className="w-8 h-8 rounded-full bg-green-600 cursor-pointer border-2 border-transparent hover:border-green-600"></div>
                <div className="w-8 h-8 rounded-full bg-purple-600 cursor-pointer border-2 border-transparent hover:border-purple-600"></div>
                <div className="w-8 h-8 rounded-full bg-red-600 cursor-pointer border-2 border-transparent hover:border-red-600"></div>
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
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <Separator />
            <Button variant="destructive" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
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
              <Button variant="outline">Change Password</Button>
              <Button variant="outline">Two-Factor Authentication</Button>
              <Button variant="outline">Login History</Button>
              <Button variant="outline">Privacy Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
