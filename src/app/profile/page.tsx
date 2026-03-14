"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeCurrentUserPassword, getCurrentUserProfile, updateCurrentUserProfile } from "@/services/authService";

const profileSchema = z.object({
  fullName: z.string().max(120),
  phone: z.string().max(30),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isSavingProfile },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    void (async () => {
      try {
        setLoadingProfile(true);
        setProfileError(null);
        const profile = await getCurrentUserProfile();
        setEmail(profile.email);
        setRole(profile.role);
        resetProfile({
          fullName: profile.full_name ?? "",
          phone: profile.phone ?? "",
        });
      } catch (error) {
        setProfileError(error instanceof Error ? error.message : "Unable to load profile.");
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [resetProfile]);

  return (
    <AppShell>
      <PageHeader title="Profile" description="Manage your account details and security settings." />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-base font-semibold text-slate-900">Update Profile</h3>
          {loadingProfile ? <p className="mb-3 text-sm text-slate-600">Loading profile...</p> : null}
          <form
            className="space-y-4"
            onSubmit={handleProfileSubmit(async (values) => {
              try {
                setProfileMessage(null);
                setProfileError(null);
                await updateCurrentUserProfile(values);
                setProfileMessage("Profile updated successfully.");
              } catch (error) {
                setProfileError(error instanceof Error ? error.message : "Unable to update profile.");
              }
            })}
          >
            <div>
              <Label>Email</Label>
              <Input value={email} disabled readOnly />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={role} disabled readOnly />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input placeholder="Your full name" {...registerProfile("fullName")} />
              <p className="mt-1 text-xs text-rose-600">{profileErrors.fullName?.message}</p>
            </div>
            <div>
              <Label>Phone</Label>
              <Input placeholder="Contact number" {...registerProfile("phone")} />
              <p className="mt-1 text-xs text-rose-600">{profileErrors.phone?.message}</p>
            </div>
            {profileError ? <p className="text-sm text-rose-700">{profileError}</p> : null}
            {profileMessage ? <p className="text-sm text-emerald-700">{profileMessage}</p> : null}
            <Button type="submit" disabled={isSavingProfile || loadingProfile}>
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className="mb-4 text-base font-semibold text-slate-900">Change Password</h3>
          <form
            className="space-y-4"
            onSubmit={handlePasswordSubmit(async (values) => {
              try {
                setPasswordMessage(null);
                setPasswordError(null);
                await changeCurrentUserPassword({
                  currentPassword: values.currentPassword,
                  newPassword: values.newPassword,
                });
                resetPassword();
                setPasswordMessage("Password changed successfully.");
              } catch (error) {
                setPasswordError(error instanceof Error ? error.message : "Unable to change password.");
              }
            })}
          >
            <div>
              <Label>Current Password</Label>
              <Input type="password" {...registerPassword("currentPassword")} />
              <p className="mt-1 text-xs text-rose-600">{passwordErrors.currentPassword?.message}</p>
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" {...registerPassword("newPassword")} />
              <p className="mt-1 text-xs text-rose-600">{passwordErrors.newPassword?.message}</p>
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input type="password" {...registerPassword("confirmPassword")} />
              <p className="mt-1 text-xs text-rose-600">{passwordErrors.confirmPassword?.message}</p>
            </div>
            {passwordError ? <p className="text-sm text-rose-700">{passwordError}</p> : null}
            {passwordMessage ? <p className="text-sm text-emerald-700">{passwordMessage}</p> : null}
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </Card>
      </section>
    </AppShell>
  );
}
