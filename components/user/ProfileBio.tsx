import React from "react";
import { renderBioContent } from "@/lib/profile";

interface ProfileBioProps {
  bio?: string;
}

export function ProfileBio({ bio }: ProfileBioProps) {
  if (!bio) return null;
  return (
    <div className="relative">
      <div className="text-neutral-500 max-w-md mx-auto prose prose-sm prose-neutral">
        {renderBioContent(bio)}
      </div>
    </div>
  );
}
