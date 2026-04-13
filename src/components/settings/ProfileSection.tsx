import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Save } from "lucide-react";
import SettingsCard from "./SettingsCard";
import {
  useChangeSettingsPassword,
  useSettingsProfile,
  useUpdateSettingsProfile,
  useUploadSettingsAvatar,
} from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";

const ProfileSection = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data, isLoading, error, refetch } = useSettingsProfile();
  const updateProfile = useUpdateSettingsProfile();
  const uploadAvatar = useUploadSettingsAvatar();
  const changePassword = useChangeSettingsPassword();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    avatarUrl: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!data) return;

    setProfile({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phone: data.phone || "",
      bio: data.bio || "",
      avatarUrl: data.avatarUrl || "",
    });
  }, [data]);

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForms = () => {
    if (data) {
      setProfile({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        bio: data.bio || "",
        avatarUrl: data.avatarUrl || "",
      });
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        bio: profile.bio.trim(),
      });

      toast({
        title: "Profile updated",
        description: "Your profile settings have been saved.",
        variant: "success",
      });
    } catch (mutationError) {
      toast({
        title: "Profile update failed",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Unable to save your profile right now.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast({
        title: "Missing password fields",
        description: "Fill in your current password and the new password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await changePassword.mutateAsync(passwordForm);
      toast({
        title: "Password updated",
        description: response.message || "Your password has been changed.",
        variant: "success",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (mutationError) {
      toast({
        title: "Password update failed",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Unable to change your password right now.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const nextProfile = await uploadAvatar.mutateAsync(file);
      setProfile((prev) => ({
        ...prev,
        avatarUrl: nextProfile.avatarUrl || prev.avatarUrl,
      }));

      toast({
        title: "Avatar updated",
        description: "Your profile photo has been uploaded.",
        variant: "success",
      });
    } catch (mutationError) {
      toast({
        title: "Avatar upload failed",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Unable to upload this image right now.",
        variant: "destructive",
      });
    }
  };

  const displayName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const initials = displayName
    ? displayName
        .split(" ")
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
    : profile.email
      ? profile.email.slice(0, 2).toUpperCase()
      : "U";

  if (isLoading && !data) {
    return (
      <SettingsCard
        title="Personal Information"
        description="Update your personal details and public profile."
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your profile settings...
        </div>
      </SettingsCard>
    );
  }

  if (error && !data) {
    return (
      <SettingsCard
        title="Personal Information"
        description="Update your personal details and public profile."
      >
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "We couldn't load your profile settings."}
        </p>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </SettingsCard>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Personal Information"
        description="Update your personal details and public profile."
      >
        <div className="flex items-center gap-5 pb-2">
          <div className="relative group">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage
                src={profile.avatarUrl || undefined}
                alt={displayName || "Profile"}
              />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-lg font-display">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
            >
              {uploadAvatar.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-background" />
              ) : (
                <Camera className="h-5 w-5 text-background" />
              )}
            </button>
          </div>
          <div>
            <p className="font-medium text-foreground">Profile Photo</p>
            <p className="text-sm text-muted-foreground">
              JPG, PNG or GIF. Max 2MB.
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          className="hidden"
          onChange={handleAvatarChange}
        />

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
            <Input
              id="currentPassword"
              type="password"
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
            />
          </div>
          <div />
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleChangePassword}
            disabled={changePassword.isPending}
          >
            {changePassword.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </div>
      </SettingsCard>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={resetForms}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSaveProfile}
          disabled={updateProfile.isPending || uploadAvatar.isPending}
        >
          {updateProfile.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSection;
