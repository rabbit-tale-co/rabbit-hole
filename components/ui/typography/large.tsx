interface TypographyLargeProps {
  children: React.ReactNode;
  className?: string;
}

export function TypographyLarge({ children, className = "" }: TypographyLargeProps) {
  return (
    <div className={`text-lg font-semibold ${className}`}>
      {children}
    </div>
  )
}
