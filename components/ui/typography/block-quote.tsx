interface TypographyBlockquoteProps {
  children: React.ReactNode;
  className?: string;
}

export function TypographyBlockquote({ children, className = "" }: TypographyBlockquoteProps) {
  return (
    <blockquote className={`mt-6 border-l-2 pl-6 italic ${className}`}>
      {children}
    </blockquote>
  )
}
