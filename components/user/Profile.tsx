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

interface UserProfileData {
  user_id: string;
  username: string;
  display_name: string;
  bio?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  accent_color?: string | null;
}

interface UserProfileProps {
  profile: UserProfileData;
  stats: { followers: number; following: number; posts: number };
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}

export function UserProfile({ profile, stats, isOwnProfile }: UserProfileProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Use provided accentColor or generate one based on username
  const currentAccentColor = useMemo(() => generateAccentColor(profile.username), [profile.username]);

  // Get color styles for colors
  const { coverBgStyle } = useMemo(() => {
    if (profile.accent_color) return getUserAccentStylesFromHex(profile.accent_color);
    return getUserAccentStyles(currentAccentColor);
  }, [currentAccentColor, profile.accent_color]);

  // no longer needed since we reuse SettingsDialog's profile section

  return (
    <>
      {/* Cover Image or Pastel Background */}
      <ProfileCover coverImage={profile.cover_url || undefined} coverBgStyle={coverBgStyle} />

      {/* Profile Picture */}
      <div className="flex justify-center -mt-16 relative z-10">

        <UserAvatar
          username={profile.username}
          avatarUrl={profile.avatar_url || undefined}
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
              onClick={() => setIsEditDialogOpen(true)}
            >
              <OutlineEdit size={14} />
              Edit Profile
            </Button>
          </div>
        )}

      </div>

      {/* Profile Info */}
      <div className="text-center mt-2 px-4 space-y-2">
        <div className="relative inline-block">
          <h3 className="text-2xl font-bold text-neutral-950">{profile.display_name}</h3>
          <p className="text-neutral-600">@{profile.username}</p>
        </div>

        <ProfileBio bio={profile.bio || undefined} />

        {/* Stats Grid */}
        <ProfileStats
          posts={stats.posts}
          following={stats.following}
          followers={stats.followers}
        />

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
