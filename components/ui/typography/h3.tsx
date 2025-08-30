interface TypographyH3Props {
  children: React.ReactNode;
  className?: string;
}

export function TypographyH3({ children, className = "" }: TypographyH3Props) {
  return (
    <h3 className={`scroll-m-20 text-2xl font-semibold tracking-tight ${className}`}>
      {children}
    </h3>
  )
}
