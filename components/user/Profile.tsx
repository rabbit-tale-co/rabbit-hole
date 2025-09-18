import React, { useMemo, useState, useCallback, useRef } from "react";
import { ModerationMenu } from "@/components/mod/ModerationMenu";
import { SettingsDialog } from "@/components/settings/Dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useFollow } from "@/hooks/useFollow";
import { generateAccentColor } from "@/lib/accent-colors";
import { getUserAccentStyles, getUserAccentStylesFromHex } from "@/lib/profile";
import { useAuth } from "@/providers/AuthProvider";
import { FollowButton } from "./FollowButton";
import { PremiumBadge } from "./PremiumBadge";
import { ProfileBio } from "./ProfileBio";
import { ProfileCover } from "./ProfileCover";
import { ProfileStats } from "./ProfileStats";
import { ProfileFeedSelector, ProfileFeedType } from "./ProfileFeedSelector";
import Feed from "../feed/Index";

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
  stats: { posts: number }; // posts count from props, followers/following from useFollow
  isOwnProfile: boolean;
  isLoading?: boolean;
  onEditProfile?: () => void;
}

export function UserProfile({
  profile,
  stats,
  isOwnProfile,
  isLoading = false,
}: UserProfileProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentFeed, setCurrentFeed] = useState<ProfileFeedType>("posts");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log("[Profile] currentFeed:", currentFeed);

  const handleFeedChange = useCallback((feed: ProfileFeedType) => {
    console.log("[Profile] handleFeedChange called with:", feed);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Debounce the feed change by 150ms
    timeoutRef.current = setTimeout(() => {
      console.log("[Profile] Actually changing feed to:", feed);
      setCurrentFeed(feed);
      timeoutRef.current = null;
    }, 150);
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);
  const { profile: myProfile } = useAuth();
  const isAdmin = Boolean(
    (myProfile as unknown as { is_admin?: boolean } | null)?.is_admin,
  );
  // Generate accent color only when user doesn't have custom color
  const generatedAccentColor = useMemo(
    () => generateAccentColor(profile.user_id),
    [profile.user_id],
  );
  const {
    loading: followLoading,
    followers,
    following,
    isFollowing,
    canFollow,
    toggleFollow,
  } = useFollow(profile.user_id);

  // Debug logs
  console.log("[UserProfile] Debug:", {
    isOwnProfile,
    canFollow,
    isFollowing,
    followLoading,
    profileUserId: profile.user_id,
    myProfileUserId: myProfile?.user_id,
  });

  // Get color styles for colors
  const { coverBgStyle } = useMemo(() => {
    if (profile.accent_color)
      return getUserAccentStylesFromHex(profile.accent_color);
    return getUserAccentStyles(generatedAccentColor);
  }, [generatedAccentColor, profile.accent_color]);

  const isSuspended = Boolean(
    profile.banned_until && Date.parse(profile.banned_until) > Date.now(),
  );

  return (
    <>
      {/* Cover Image or Pastel Background; for suspended force default (no image) */}
      <ProfileCover
        coverImage={
          !isSuspended || isOwnProfile
            ? profile.cover_url || undefined
            : undefined
        }
        coverBgStyle={coverBgStyle}
      />

      {/* Profile Picture */}
      <div className="flex justify-center -mt-16 relative z-10">
        <UserAvatar
          username={profile.username}
          avatarUrl={
            !isSuspended || isOwnProfile
              ? profile.avatar_url || undefined
              : undefined
          }
          size="2xl"
          accentColor={profile.accent_color ? undefined : generatedAccentColor}
          accentHex={profile.accent_color || undefined}
          showBorder={true}
          className="flex items-center justify-center text-2xl font-bold"
        />

        {/* Avatar Actions - Floating like UserProfile */}
        <div className="absolute bottom-4 right-0 flex items-center gap-2">
          {isOwnProfile && (
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              Edit Profile
            </Button>
          )}
          {!isOwnProfile && (
            <FollowButton
              isFollowing={isFollowing}
              loading={followLoading}
              canFollow={canFollow}
              onToggle={toggleFollow}
              size={"default"}
              showText={true}
            />
          )}
          {isAdmin && !isOwnProfile && (
            <ModerationMenu
              targetUserId={profile.user_id}
              isSuspended={isSuspended}
              onAfter={() => { }}
            />
          )}
        </div>
      </div>


      {/* Profile Info */}
      <div className="text-center mt-2 px-4 space-y-2">
        <div className="relative inline-block">
          <h3 className="text-2xl font-bold text-neutral-950 dark:text-neutral-50 inline-flex items-center gap-2">
            <span>{profile.display_name}</span>
            <PremiumBadge show={Boolean(profile.is_premium)} />
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            @{profile.username}
          </p>
        </div>

        {!isSuspended ? (
          <ProfileBio bio={profile.bio || undefined} />
        ) : (
          !isOwnProfile && (
            <p className="text-sm text-muted-foreground">
              This account is suspended.
            </p>
          )
        )}

        {/* Stats Grid */}
        {!isSuspended && (
          <ProfileStats
            posts={stats.posts}
            following={following}
            followers={followers}
            targetUserId={profile.user_id}
            targetUsername={profile.username}
            isOwnProfile={isOwnProfile}
            showAdminStats={isAdmin}
            isLoading={isLoading || followLoading}
          />
        )}

        {/* Feed Selector */}
        {!isSuspended && (
          <div className="mt-6">
            <ProfileFeedSelector
              currentFeed={currentFeed}
              onFeedChange={handleFeedChange}
            />
          </div>
        )}

        {/* Feed Content */}
        {!isSuspended && (
          <div className="mt-6">
            <Feed
              username={profile.username}
              isOwnProfile={isOwnProfile}
              emptyStateVariant="home"
              profileFeedType={currentFeed}
            />
            {/* Debug: show current feed */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground mt-2">
                Debug: currentFeed = {currentFeed}
              </div>
            )}
          </div>
        )}
      </div>

      {isEditDialogOpen && (
        <SettingsDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          initialSection="profile"
        />
      )}
    </>
  );
}
