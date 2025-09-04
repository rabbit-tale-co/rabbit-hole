import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { SettingsDialog } from "@/components/settings/Dialog";
import { generateAccentColor } from "@/lib/accent-colors";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ProfileCover } from "./ProfileCover";
import { ProfileBio } from "./ProfileBio";
import { ProfileStats } from "./ProfileStats";
import { getUserAccentStyles, getUserAccentStylesFromHex } from "@/lib/profile";
import { ModerationMenu } from "@/components/mod/ModerationMenu";
import { useAuth } from "@/providers/AuthProvider";
import { PremiumBadge } from "./PremiumBadge";
import { useFollow } from "@/hooks/useFollow";

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
  stats: { posts: number }; // Only posts count from props, followers/following from useFollow
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}

export function UserProfile({ profile, stats, isOwnProfile }: UserProfileProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { profile: myProfile } = useAuth();
  const isAdmin = Boolean((myProfile as unknown as { is_admin?: boolean } | null)?.is_admin);
  // Use provided accentColor or generate one based on username
  const currentAccentColor = useMemo(() => generateAccentColor(profile.username), [profile.username]);
  const { loading: followLoading, isFollowing, followers, following, canFollow, toggleFollow } =
    useFollow(profile.user_id);

  // Get color styles for colors
  const { coverBgStyle } = useMemo(() => {
    if (profile.accent_color) return getUserAccentStylesFromHex(profile.accent_color);
    return getUserAccentStyles(currentAccentColor);
  }, [currentAccentColor, profile.accent_color]);

  // No async admin check; rely on profiles.is_admin (same as is_premium path)

  // moderation actions moved to ModerationMenu

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
        <div className="absolute bottom-4 right-0 flex items-center gap-2">
          {isOwnProfile ? (
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              Edit Profile
            </Button>
          ) : canFollow ? (
            <Button
              variant={isFollowing ? 'secondary' : 'default'}
              disabled={followLoading}
              onClick={toggleFollow}
              aria-pressed={isFollowing}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          ) : null}
          {isAdmin && !isOwnProfile && (
            <ModerationMenu
              targetUserId={profile.user_id}
              isSuspended={isSuspended}
              onAfter={() => { }}
            />
          )}
        </div>

      </div >

      {/* Profile Info */}
      <div className="text-center mt-2 px-4 space-y-2" >
        <div className="relative inline-block">
          <h3 className="text-2xl font-bold text-neutral-950 inline-flex items-center gap-2">
            <span>{profile.display_name}</span>
            <PremiumBadge show={Boolean(profile.is_premium)} />
          </h3>
          <p className="text-neutral-600">@{profile.username}</p>
        </div>

        {
          !isSuspended ? (
            <ProfileBio bio={profile.bio || undefined} />
          ) : (
            !isOwnProfile && <p className="text-sm text-muted-foreground">This account is suspended.</p>
          )
        }

        {/* Stats Grid */}
        {
          !isSuspended && (
            <ProfileStats
              posts={stats.posts}
              following={following}
              followers={followers}
              targetUserId={profile.user_id}
              targetUsername={profile.username}
            />
          )
        }
      </div>

      {isEditDialogOpen && (
        <SettingsDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          initialSection="profile"
          sections={["profile"]}
        />
      )
      }
    </>
  );
}
