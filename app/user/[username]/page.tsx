"use client";

import { useParams } from 'next/navigation';
import { UserProfile } from '@/components/user/Profile';
import Feed from '@/components/feed/Index';
import { EmptyState } from '@/components/feed/Empty';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/providers/AuthProvider';
import Center from '@/components/Center';
import { OutlineUser } from '@/components/icons/Icons';

// Local view-only state no longer needed; we render directly from hook

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { profile, isOwn, loading } = useUserProfile(username);
  useAuth();

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
            <OutlineUser size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User not found</h1>
          <p className="text-gray-600">The user you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </Center>
    );
  }

  const isSuspended = Boolean(profile.banned_until && Date.parse(profile.banned_until) > Date.now());

  return (
    <>
      {/* UserProfile component */}
      <UserProfile
        profile={profile}
        stats={{ posts: 0 }}
        isOwnProfile={isOwn}
      />

      {!isSuspended ? (
        <Feed
          authorId={profile.user_id}
          isOwnProfile={isOwn}
          onCountChange={(n) => {
            try {
              const el = document.querySelector('[data-profile-posts-count]');
              if (el) el.textContent = String(n);
            } catch { }
          }}
        />
      ) : (
        <EmptyState
          variant="profile"
          isOwnProfile={false}
          message="This account is suspended"
          description="Posts are hidden while the account is under review."
        />
      )}

    </>
  );
}

// metadata is provided by app/user/[username]/head.tsx to avoid client "use client" restriction
