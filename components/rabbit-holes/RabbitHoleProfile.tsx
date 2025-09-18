import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { generateAccentColor } from "@/lib/accent-colors";
import { getUserAccentStyles, getUserAccentStylesFromHex } from "@/lib/profile";
import { useAuth } from "@/providers/AuthProvider";
import { ProfileCover } from "@/components/user/ProfileCover";
import { ProfileStats } from "@/components/user/ProfileStats";
import { Badge } from "@/components/ui/badge";
import { EditRabbitHoleDialog } from "./EditRabbitHoleDialog";
import { useRabbitHoles } from "@/hooks/useRabbitHoles";
import type { RabbitHole as RabbitHoleType } from "@/hooks/useRabbitHoles";

interface RabbitHoleProfileData {
  id: string;
  name: string;
  url: string;
  description?: string | null;
  rules?: string[];
  avatar_url?: string | null;
  cover_url?: string | null;
  owner_id: string;
  member_count?: number;
  post_count?: number;
  like_count?: number;
  created_at: string;
  updated_at: string;
}

interface RabbitHoleProfileProps {
  rabbitHole: RabbitHoleProfileData;
  isOwnRabbitHole: boolean;
  isLoading?: boolean;
  onEditProfile?: () => void;
}

export function RabbitHoleProfile({
  rabbitHole,
  isOwnRabbitHole,
  isLoading = false,
}: RabbitHoleProfileProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user } = useAuth();
  const { updateRabbitHole } = useRabbitHoles();
  const [isMember, setIsMember] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);

  // Generate accent color based on rabbit hole name
  const generatedAccentColor = useMemo(
    () => generateAccentColor(rabbitHole.name),
    [rabbitHole.name],
  );

  // Get color styles for colors
  const { coverBgStyle } = useMemo(() => {
    return getUserAccentStyles(generatedAccentColor);
  }, [generatedAccentColor]);

  const handleUpdateRabbitHole = async (id: string, name: string, url: string, description?: string, rules?: string[]) => {
    const result = await updateRabbitHole(id, name, url, description, rules);
    if (result) {
      setIsEditDialogOpen(false);
    }
  };

  // Normalize data for Edit dialog (description: null -> undefined)
  const editData: RabbitHoleType = {
    id: rabbitHole.id,
    name: rabbitHole.name,
    url: rabbitHole.url,
    description: rabbitHole.description ?? undefined,
    rules: rabbitHole.rules ?? undefined,
    avatar_url: rabbitHole.avatar_url ?? undefined,
    cover_url: rabbitHole.cover_url ?? undefined,
    owner_id: rabbitHole.owner_id,
    created_at: rabbitHole.created_at,
    updated_at: rabbitHole.updated_at,
  };

  // Membership handling
  useEffect(() => {
    const checkMembership = async () => {
      try {
        if (!user) return;
        const { supabase } = await import("@/lib/supabase");
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        if (!accessToken) return;

        const res = await fetch(`/api/rabbit-holes/${encodeURIComponent(rabbitHole.url)}/membership`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsMember(Boolean(data.isMember));
        }
      } catch (e) {
        console.error("[RabbitHoleProfile] membership check failed", e);
      }
    };
    checkMembership();
  }, [user, rabbitHole.url]);

  const handleJoin = async () => {
    try {
      setMembershipLoading(true);
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) return;
      const res = await fetch(`/api/rabbit-holes/${encodeURIComponent(rabbitHole.url)}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) setIsMember(true);
    } catch (e) {
      console.error("[RabbitHoleProfile] join failed", e);
    } finally {
      setMembershipLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      setMembershipLoading(true);
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) return;
      const res = await fetch(`/api/rabbit-holes/${encodeURIComponent(rabbitHole.url)}/leave`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) setIsMember(false);
    } catch (e) {
      console.error("[RabbitHoleProfile] leave failed", e);
    } finally {
      setMembershipLoading(false);
    }
  };

  return (
    <>
      {/* Cover Image or Pastel Background */}
      <ProfileCover
        coverImage={rabbitHole.cover_url || undefined}
        coverBgStyle={coverBgStyle}
      />

      {/* Profile Picture */}
      <div className="flex justify-center -mt-16 relative z-10">
        <UserAvatar
          username={rabbitHole.name}
          avatarUrl={rabbitHole.avatar_url || undefined}
          size="2xl"
          accentColor={generatedAccentColor}
          showBorder={true}
          className="flex items-center justify-center text-2xl font-bold"
        />

        {/* Actions */}
        <div className="absolute bottom-4 right-0 flex items-center gap-2">
          {user && !isOwnRabbitHole && (
            isMember ? (
              <Button variant="outline" disabled={membershipLoading} onClick={handleLeave}>
                {membershipLoading ? "Leaving…" : "Leave"}
              </Button>
            ) : (
              <Button disabled={membershipLoading} onClick={handleJoin}>
                {membershipLoading ? "Joining…" : "Join"}
              </Button>
            )
          )}
          {isOwnRabbitHole && (
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              Edit Rabbit Hole
            </Button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="text-center mt-2 px-4 space-y-2">
        <div className="relative inline-block">
          <h3 className="text-2xl font-bold text-neutral-950 dark:text-neutral-50 inline-flex items-center gap-2">
            <span>{rabbitHole.name}</span>
            <Badge variant="secondary" className="text-xs">
              Rabbit Hole
            </Badge>
          </h3>
        </div>

        {rabbitHole.description && (
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {rabbitHole.description}
          </p>
        )}

        {/* Stats Grid */}
        <ProfileStats
          posts={rabbitHole.post_count || 0}
          views={0} // Rabbit holes don't have views
          following={0} // Not applicable for rabbit holes
          followers={rabbitHole.member_count || 0}
          targetUserId={rabbitHole.owner_id}
          targetUsername={rabbitHole.name}
          isOwnProfile={isOwnRabbitHole}
          showAdminStats={false}
          isLoading={isLoading}
          customStats={[
            { label: "Members", value: rabbitHole.member_count || 0 },
            { label: "Posts", value: rabbitHole.post_count || 0 },
            { label: "Likes", value: rabbitHole.like_count || 0 },
          ]}
        />
      </div>

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <EditRabbitHoleDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          rabbitHole={editData}
        />
      )}
    </>
  );
}
