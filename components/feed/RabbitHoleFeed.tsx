"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import Feed from "@/components/feed/Index";
import { EmptyState } from "@/components/feed/Empty";
import Center from "@/components/Center";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRabbitHoleFeed } from "@/hooks/useRabbitHoleFeed";
import { RabbitHoleProfile } from "@/components/rabbit-holes/RabbitHoleProfile";

interface RabbitHoleFeedProps {
  rabbitHoleName: string;
}

export default function RabbitHoleFeed({ rabbitHoleName }: RabbitHoleFeedProps) {
  const { user, profile } = useAuth();
  const { rabbitHole, items, loading, error, hasMore, refresh } = useRabbitHoleFeed(rabbitHoleName);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const checkMembership = async () => {
      if (!user || !rabbitHole) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        if (!accessToken) return;

        const response = await fetch(`/api/rabbit-holes/${rabbitHoleName}/membership`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsMember(data.isMember);
        }
      } catch (err) {
        console.error("Error checking membership:", err);
      }
    };

    checkMembership();
  }, [user, rabbitHole, rabbitHoleName]);

  const handleJoin = async () => {
    if (!rabbitHole) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) return;

      const response = await fetch(`/api/rabbit-holes/${rabbitHoleName}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setIsMember(true);
        // Refresh the page to update member count
        window.location.reload();
      }
    } catch (err) {
      console.error("Error joining rabbit hole:", err);
    }
  };

  const handleLeave = async () => {
    if (!rabbitHole) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) return;

      const response = await fetch(`/api/rabbit-holes/${rabbitHoleName}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setIsMember(false);
        // Refresh the page to update member count
        window.location.reload();
      }
    } catch (err) {
      console.error("Error leaving rabbit hole:", err);
    }
  };

  if (loading) {
    return (
      <Center>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rabbit hole...</p>
        </div>
      </Center>
    );
  }

  if (error || !rabbitHole) {
    return (
      <Center>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Rabbit Hole Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || "This rabbit hole doesn't exist or is private."}
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </Center>
    );
  }

  return (
    <section>
      {/* Rabbit Hole Profile */}
      <RabbitHoleProfile
        rabbitHole={rabbitHole}
        isOwnRabbitHole={user?.id === rabbitHole.owner_id}
        isLoading={loading}
      />

      {/* Join/Leave Button */}
      {/* {user && (
        <div className="flex justify-center mt-4 mb-6">
          {isMember ? (
            <Button variant="outline" onClick={handleLeave}>
              Leave
            </Button>
          ) : (
            <Button onClick={handleJoin}>
              Join
            </Button>
          )}
        </div>
      )} */}

      {/* Feed */}
      {items.length === 0 ? (
        <EmptyState
          variant="rabbit-hole"
          isOwnProfile={false}
          message="No posts yet"
          description={`Be the first to post in r/${rabbitHole.name}!`}
        />
      ) : (
        <Feed
          rabbitHole={rabbitHoleName}
        />
      )}
    </section>
  );
}
