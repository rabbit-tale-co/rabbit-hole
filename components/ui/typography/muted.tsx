interface TypographyMutedProps {
  children: React.ReactNode;
  className?: string;
}

export function TypographyMuted({ children, className = "" }: TypographyMutedProps) {
  return (
    <p className={`text-muted-foreground text-sm ${className}`}>
      {children}
    </p>
  )
}
