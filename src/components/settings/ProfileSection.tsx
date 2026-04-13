import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save } from "lucide-react";
import SettingsCard from "./SettingsCard";

const ProfileSection = () => {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@farmfresh.com",
    phone: "+1 (555) 123-4567",
    bio: "Passionate about sustainable farming and fresh produce.",
  });

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Personal Information"
        description="Update your personal details and public profile."
      >
        <div className="flex items-center gap-5 pb-2">
          <div className="relative group">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src="" />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-lg font-display">
                JD
              </AvatarFallback>
            </Avatar>
            <button className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-background" />
            </button>
          </div>
          <div>
            <p className="font-medium text-foreground">Profile Photo</p>
            <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={profile.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={profile.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            value={profile.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Password" description="Change your account password.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input id="currentPassword" type="password" placeholder="••••••••" />
          </div>
          <div />
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" />
          </div>
        </div>
      </SettingsCard>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileSection;
