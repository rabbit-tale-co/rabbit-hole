export function Container({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`mx-auto w-full max-w-4xl px-3 lg:px-0 ${className}`}>{children}</div>;
}
