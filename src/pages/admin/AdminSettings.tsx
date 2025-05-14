
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Store, Bell, Globe } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  
  const [profileForm, setProfileForm] = useState({
    name: "Admin User",
    email: "admin@fishfarm.com",
    phone: "123-456-7890",
    bio: "Fish farming specialist with over 10 years of experience in aquaculture management."
  });
  
  const [storeForm, setStoreForm] = useState({
    storeName: "FishFarm",
    storeEmail: "info@fishfarm.com",
    storePhone: "555-123-4567",
    storeAddress: "123 Aqua Lane, Fishville, FL 12345",
    currency: "USD",
    timezone: "America/New_York"
  });
  
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    productUpdates: false,
    marketingEmails: false
  });
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully."
    });
  };
  
  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Store Settings Updated",
      description: "Your store settings have been updated successfully."
    });
  };
  
  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        description: "New password and confirm password must match.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully."
    });
  };
  
  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Notification Preferences Updated",
      description: "Your notification preferences have been saved."
    });
  };
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-4 w-full sm:w-[600px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Admin Profile</CardTitle>
                  <CardDescription>
                    Manage your personal information and profile settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileForm.email} 
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={profileForm.phone} 
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea 
                      id="bio" 
                      className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
                      value={profileForm.bio} 
                      onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})} 
                    />
                  </div>
                  <Button type="submit">Save Profile</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="store" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Store Settings</CardTitle>
                  <CardDescription>
                    Configure your store details and preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStoreSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input 
                      id="storeName" 
                      value={storeForm.storeName} 
                      onChange={(e) => setStoreForm({...storeForm, storeName: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="storeEmail">Store Email</Label>
                    <Input 
                      id="storeEmail" 
                      type="email" 
                      value={storeForm.storeEmail} 
                      onChange={(e) => setStoreForm({...storeForm, storeEmail: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="storePhone">Store Phone</Label>
                    <Input 
                      id="storePhone" 
                      value={storeForm.storePhone} 
                      onChange={(e) => setStoreForm({...storeForm, storePhone: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="storeAddress">Store Address</Label>
                    <Input 
                      id="storeAddress" 
                      value={storeForm.storeAddress} 
                      onChange={(e) => setStoreForm({...storeForm, storeAddress: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="currency">Currency</Label>
                      <select 
                        id="currency" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                        value={storeForm.currency} 
                        onChange={(e) => setStoreForm({...storeForm, currency: e.target.value})}
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="timezone">Timezone</Label>
                      <select 
                        id="timezone" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                        value={storeForm.timezone} 
                        onChange={(e) => setStoreForm({...storeForm, timezone: e.target.value})}
                      >
                        <option value="America/New_York">Eastern Time (US & Canada)</option>
                        <option value="America/Chicago">Central Time (US & Canada)</option>
                        <option value="America/Denver">Mountain Time (US & Canada)</option>
                        <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit">Save Store Settings</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Manage your password and security settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSecuritySubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      value={securityForm.currentPassword} 
                      onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      value={securityForm.newPassword} 
                      onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={securityForm.confirmPassword} 
                      onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})} 
                    />
                  </div>
                  <Button type="submit">Change Password</Button>
                </div>
              </form>
              
              <Separator className="my-6" />
              
              <div className="grid gap-6">
                <div>
                  <h3 className="font-medium mb-3">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Sessions</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Manage your active sessions and sign out from other devices.
                  </p>
                  <Button variant="outline">Manage Sessions</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure which notifications you want to receive
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationSubmit}>
                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailNotifications} 
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, emailNotifications: checked})
                      } 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Order Updates</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when orders are placed or updated
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.orderUpdates} 
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, orderUpdates: checked})
                      } 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Product Updates</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about product inventory and changes
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.productUpdates} 
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, productUpdates: checked})
                      } 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Marketing Emails</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional emails and special offers
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.marketingEmails} 
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, marketingEmails: checked})
                      } 
                    />
                  </div>
                  
                  <Button type="submit">Save Notification Preferences</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
