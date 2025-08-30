interface TypographyLeadProps {
  children: React.ReactNode;
  className?: string;
}

export function TypographyLead({ children, className = "" }: TypographyLeadProps) {
  return (
    <p className={`text-muted-foreground text-xl ${className}`}>
      {children}
    </p>
  )
}
