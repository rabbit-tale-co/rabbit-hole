export function Container({
  children,
  className,
  maxWidth = "4xl"
}: {
  children: React.ReactNode,
  className?: string,
  maxWidth?: "lg" | "4xl"
}) {
  const maxWidthClass = maxWidth === "lg" ? "max-w-xl" : "max-w-4xl";
  return <div className={`mx-auto w-full ${maxWidthClass} px-3 lg:px-0 ${className}`}>{children}</div>;
}
