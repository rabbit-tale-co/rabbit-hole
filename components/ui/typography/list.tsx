interface TypographyListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'ul' | 'ol';
}

export function TypographyList({ children, className = "", variant = 'ul' }: TypographyListProps) {
  const ListComponent = variant;
  const listStyles = variant === 'ul'
    ? 'ml-6 [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:mt-3 [&>li]:before:top-2 [&>li]:before:size-1.5 [&>li]:before:bg-current [&>li]:before:rounded-full [&>li]:before:content-[""]'
    : 'ml-6 list-decimal';

  return (
    <ListComponent
      className={`${listStyles} ${className}`}
      style={{ listStyle: 'none' }}
    >
      {children}
    </ListComponent>
  )
}
