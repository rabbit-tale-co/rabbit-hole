import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAccentColor, getAccentColorStyle, type AccentColor, getStyleFromHexShade } from "@/lib/accent-colors";
import { OutlineUser } from "../icons/Icons";

interface UserAvatarProps {
  username: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  accentColor?: AccentColor;
  accentHex?: string | null;
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
  accentHex,
  className = '',
  showBorder = false
}: UserAvatarProps) {
  // Use provided accentColor or generate one based on username
  const currentAccentColor = accentColor || generateAccentColor(username);

  // Get color styles for fallback
  const avatarBgStyle = accentHex ? getStyleFromHexShade(accentHex, '200', 'backgroundColor') : getAccentColorStyle(currentAccentColor, 200, 'backgroundColor');
  const avatarForegroundStyle = accentHex ? getStyleFromHexShade(accentHex, '950', 'color') : getAccentColorStyle(currentAccentColor, 950, 'color');

  const sizeClass = sizeClasses[size];
  const fallbackSize = fallbackSizes[size];
  const borderClass = showBorder ? 'border-4 border-white' : '';

  const isWebm = Boolean(avatarUrl && /\.webm(\?|#|$)/i.test(avatarUrl));

  return (
    <Avatar className={`${sizeClass} ${borderClass} ${className}`}>
      {isWebm ? (
        <video
          key={avatarUrl}
          src={avatarUrl}
          className="size-full object-cover"
          muted
          playsInline
          autoPlay
          loop
          style={avatarBgStyle as React.CSSProperties}
        />
      ) : (
        <AvatarImage key={avatarUrl} src={avatarUrl} alt={`${username} avatar`} style={avatarBgStyle} />
      )}
      {!isWebm && (
        <AvatarFallback
          className="font-bold rounded-md"
          style={{ ...avatarBgStyle, ...avatarForegroundStyle }}
        >
          <OutlineUser size={fallbackSize} />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
