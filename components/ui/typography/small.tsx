interface TypographySmallProps {
  children: React.ReactNode;
  className?: string;
}

export function TypographySmall({ children, className = "" }: TypographySmallProps) {
  return (
    <small className={`text-sm leading-none font-medium ${className}`}>
      {children}
    </small>
  )
}
