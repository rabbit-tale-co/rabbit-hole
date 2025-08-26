import Image from "next/image";
import React from "react";

interface ProfileCoverProps {
  coverImage?: string;
  coverBgStyle?: React.CSSProperties;
  className?: string;
}

export function ProfileCover({ coverImage, coverBgStyle, className }: ProfileCoverProps) {
  return (
    <div className={`relative h-72 w-full rounded-3xl ${className ?? ""}`} style={coverBgStyle}>
      {coverImage && (
        <Image
          src={coverImage}
          alt="Cover artwork"
          fill
          className="object-cover rounded-3xl"
        />
      )}
    </div>
  );
}
