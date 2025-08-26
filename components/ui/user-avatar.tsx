import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { generateAccentColor, getAccentColorStyle, type AccentColor } from "@/lib/accent-colors";

interface UserAvatarProps {
  username: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  accentColor?: AccentColor;
  className?: string;
  showBorder?: boolean;
}

const sizeClasses = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
  xl: 'size-16',
  '2xl': 'size-32'
};

const fallbackSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48
};

export function UserAvatar({
  username,
  avatarUrl,
  size = 'md',
  accentColor,
  className = '',
  showBorder = false
}: UserAvatarProps) {
  // Use provided accentColor or generate one based on username
  const currentAccentColor = accentColor || generateAccentColor(username);

  // Get color styles for fallback
  const avatarBgStyle = getAccentColorStyle(currentAccentColor, 200, 'backgroundColor');
  const avatarForegroundStyle = getAccentColorStyle(currentAccentColor, 950, 'color');

  const sizeClass = sizeClasses[size];
  const fallbackSize = fallbackSizes[size];
  const borderClass = showBorder ? 'border-4 border-white' : '';

  return (
    <Avatar className={`${sizeClass} ${borderClass} ${className}`}>
      <AvatarImage src={avatarUrl} alt={`${username} avatar`} />
      <AvatarFallback
        className="font-bold"
        style={{ ...avatarBgStyle, ...avatarForegroundStyle }}
      >
        <User size={fallbackSize} />
      </AvatarFallback>
    </Avatar>
  );
}
