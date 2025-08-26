"use client";

import { useParams } from 'next/navigation';
import { UserProfile } from '@/components/user/Profile';
import Feed from '@/components/feed/Index';
import { User } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import Center from '@/components/Center';

// Local view-only state no longer needed; we render directly from hook

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { profile, isOwn, loading } = useUserProfile(username);

  if (loading) {
    return (
      <Center>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </Center>
    );
  }

  if (!profile) {
    return (
      <Center>
        <div className="text-center flex flex-col items-center gap-2">
          <div className="size-24 rounded-full bg-neutral-100 text-neutral-950 flex items-center justify-center">
            <User size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User not found</h1>
          <p className="text-gray-600">The user you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </Center>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* UserProfile component */}
      <UserProfile
        displayName={profile.display_name}
        username={profile.username}
        coverImage={profile.cover_url || undefined}
        avatarImage={profile.avatar_url || undefined}
        stats={{ followers: 0, following: 0, posts: 0 }}
        isOwnProfile={isOwn}
      />

      <div className="max-w-4xl mx-auto w-[56rem]">
        <Feed debugLoading={false} authorId={profile.user_id} isOwnProfile={isOwn} />
      </div>
    </div>
  );
}
