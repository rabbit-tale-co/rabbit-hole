import Image from "next/image";
import React from "react";

interface ProfileCoverProps {
  coverImage?: string;
  coverBgStyle?: React.CSSProperties;
  className?: string;
}

export function ProfileCover({ coverImage, coverBgStyle, className }: ProfileCoverProps) {
  return (
    <div className={`relative h-72 w-full rounded-3xl ring-1 ring-ring/30 ${className ?? ""}`} style={coverBgStyle}>
      {coverImage && (/\.webm(\?|#|$)/i.test(coverImage) ? (
        <video
          key={coverImage}
          src={coverImage}
          className="absolute inset-0 size-full object-cover rounded-3xl"
          muted
          playsInline
          autoPlay
          loop
        />
      ) : (
        <Image
          key={coverImage}
          src={coverImage}
          alt="Cover artwork"
          fill
          className="object-cover rounded-3xl"
        />
      ))}
    </div>
  );
}
