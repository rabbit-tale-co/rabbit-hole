import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { OutlineEdit } from "@/components/icons/Icons";
import { EditProfileDialog } from "./Edit";
import { generateAccentColor, type AccentColor } from "@/lib/accent-colors";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ProfileCover } from "./ProfileCover";
import { ProfileBio } from "./ProfileBio";
import { ProfileStats } from "./ProfileStats";
import { getUserAccentStyles } from "@/lib/profile";

interface UserProfileProps {
  displayName: string;
  username: string;
  coverImage?: string;
  avatarImage?: string;
  accentColor?: AccentColor;
  bio?: string;
  stats: {
    followers: number;
    following: number;
    posts: number;
  };
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}

export function UserProfile({ displayName, username, coverImage, avatarImage, accentColor, bio, stats, isOwnProfile }: UserProfileProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Use provided accentColor or generate one based on username
  const currentAccentColor = useMemo(() => accentColor || generateAccentColor(username), [accentColor, username]);

  // Get color styles for colors
  const { coverBgStyle } = useMemo(() => getUserAccentStyles(currentAccentColor), [currentAccentColor]);

  // Create user profile object for EditProfileDialog
  const userProfile = useMemo(() => ({
    id: username || 'user-id',
    email: '',
    username,
    avatar: {
      url: avatarImage || '',
      alt: username || 'User',
      size: { width: 128, height: 128 },
    },
    cover: {
      url: coverImage || '',
      alt: 'Cover',
      size: { width: 800, height: 288 },
    },
  }), [username, avatarImage, coverImage]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Image or Pastel Background */}
      <ProfileCover coverImage={coverImage} coverBgStyle={coverBgStyle} />

      {/* Profile Picture */}
      <div className="flex justify-center -mt-16 relative z-10">

        <UserAvatar
          username={username}
          avatarUrl={avatarImage}
          size="2xl"
          accentColor={currentAccentColor}
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
          <h3 className="text-2xl font-bold text-neutral-950">{displayName}</h3>
          <p className="text-neutral-600">@{username}</p>
        </div>

        <ProfileBio bio={bio} />

        {/* Stats Grid */}
        <ProfileStats
          posts={stats.posts}
          following={stats.following}
          followers={stats.followers}
        />

      </div>

      {isEditDialogOpen && (
        <EditProfileDialog
          user={userProfile}
          onClose={() => setIsEditDialogOpen(false)}
          onProfileUpdated={() => {
            // Update local state if needed
            setIsEditDialogOpen(false);
          }}
        />
      )}
    </div>

  );
}
