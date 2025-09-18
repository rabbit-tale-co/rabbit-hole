"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import Feed from "@/components/feed/Index";
import Center from "@/components/Center";

export default function FollowingFeed() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!user || !profile) {
      router.push("/");
      return;
    }
    setLoading(false);
  }, [user, profile, router]);

  if (loading) {
    return (
      <Center>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </Center>
    );
  }

  if (!user || !profile) {
    return null; // Will redirect
  }

  return (
    <section>
      <Feed
        following={true}
        emptyStateVariant="following"
      />
    </section>
  );
}
