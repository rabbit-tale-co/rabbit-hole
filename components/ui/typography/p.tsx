interface TypographyPProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export function TypographyP({ children, className = "", ...props }: TypographyPProps) {
  return (
    <p className={`leading-7 [&:not(:first-child)]:mt-6 ${className}`} {...props}>
      {children}
    </p>
  )
}
