import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { OutlineEdit } from "@/components/icons/Icons";
import { SettingsDialog } from "@/components/settings/Dialog";
import { generateAccentColor } from "@/lib/accent-colors";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ProfileCover } from "./ProfileCover";
import { ProfileBio } from "./ProfileBio";
import { ProfileStats } from "./ProfileStats";
import { getUserAccentStyles, getUserAccentStylesFromHex } from "@/lib/profile";
import { useIsMobile } from "@/hooks/useMobile";
import { adminBanUser, adminUnbanUser } from "@/app/actions/admin";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { PremiumBadge } from "./PremiumBadge";

interface UserProfileData {
  user_id: string;
  username: string;
  display_name: string;
  bio?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  accent_color?: string | null;
  banned_until?: string | null;
  is_premium?: boolean | null;
}

interface UserProfileProps {
  profile: UserProfileData;
  stats: { followers: number; following: number; posts: number };
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}

export function UserProfile({ profile, stats, isOwnProfile }: UserProfileProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const { profile: myProfile } = useAuth();
  const isAdmin = Boolean((myProfile as unknown as { is_admin?: boolean } | null)?.is_admin);
  const [modBusy, setModBusy] = useState(false);
  // Use provided accentColor or generate one based on username
  const currentAccentColor = useMemo(() => generateAccentColor(profile.username), [profile.username]);

  // Get color styles for colors
  const { coverBgStyle } = useMemo(() => {
    if (profile.accent_color) return getUserAccentStylesFromHex(profile.accent_color);
    return getUserAccentStyles(currentAccentColor);
  }, [currentAccentColor, profile.accent_color]);

  // No async admin check; rely on profiles.is_admin (same as is_premium path)

  async function ban7Days() {
    try {
      setModBusy(true);
      const until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const r = await adminBanUser(profile.user_id, until);
      const err = (r as unknown as { error?: string }).error;
      if (err) { toast.error(err); return; }
      toast.success("User banned for 7 days");
      try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
    } finally { setModBusy(false); }
  }

  async function unbanNow() {
    try {
      setModBusy(true);
      const r = await adminUnbanUser(profile.user_id);
      const err = (r as unknown as { error?: string }).error;
      if (err) { toast.error(err); return; }
      toast.success("User unbanned");
      try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
    } finally { setModBusy(false); }
  }

  // no longer needed since we reuse SettingsDialog's profile section

  const isSuspended = Boolean(profile.banned_until && Date.parse(profile.banned_until) > Date.now());

  return (
    <>
      {/* Cover Image or Pastel Background; for suspended force default (no image) */}
      <ProfileCover
        coverImage={(!isSuspended || isOwnProfile) ? (profile.cover_url || undefined) : undefined}
        coverBgStyle={coverBgStyle}
      />

      {/* Profile Picture */}
      <div className="flex justify-center -mt-16 relative z-10">

        <UserAvatar
          username={profile.username}
          avatarUrl={(!isSuspended || isOwnProfile) ? (profile.avatar_url || undefined) : undefined}
          size="2xl"
          accentColor={currentAccentColor}
          accentHex={profile.accent_color || undefined}
          showBorder={true}
          className="flex items-center justify-center text-2xl font-bold"
        />

        {/* Avatar Actions - Floating like UserProfile */}
        {isOwnProfile && (
          <div className="absolute bottom-4 right-0">
            <Button
              variant="outline"
              size={isMobile ? "icon" : "default"}
              onClick={() => setIsEditDialogOpen(true)}
            >
              <OutlineEdit size={14} />
              <span className="hidden md:block">
                Edit Profile
              </span>
            </Button>
          </div>
        )}

      </div>

      {/* Profile Info */}
      <div className="text-center mt-2 px-4 space-y-2">
        <div className="relative inline-block">
          <h3 className="text-2xl font-bold text-neutral-950 inline-flex items-center gap-2">
            <span>{profile.display_name}</span>
            <PremiumBadge show={Boolean(profile.is_premium)} />
          </h3>
          <p className="text-neutral-600">@{profile.username}</p>
        </div>

        {/* Admin moderation tools (visible only to admins on others' profiles) */}
        {isAdmin && !isOwnProfile && (
          <div className="mt-2 flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Moderator Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuLabel>Moderation</DropdownMenuLabel>
                <DropdownMenuItem onClick={ban7Days} disabled={modBusy}>Ban 7 days</DropdownMenuItem>
                <DropdownMenuItem onClick={unbanNow} disabled={modBusy}>Unban</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {!isSuspended ? (
          <ProfileBio bio={profile.bio || undefined} />
        ) : (
          !isOwnProfile && <p className="text-sm text-muted-foreground">This account is suspended.</p>
        )}

        {/* Stats Grid */}
        {!isSuspended && (
          <ProfileStats
            posts={stats.posts}
            following={stats.following}
            followers={stats.followers}
          />
        )}

      </div>

      {isEditDialogOpen && (
        <SettingsDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          initialSection="profile"
          sections={["profile"]}
        />
      )}
    </>
  );
}
