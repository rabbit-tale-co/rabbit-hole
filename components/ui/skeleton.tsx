import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("rounded-md bg-neutral-200 dark:bg-neutral-800", className)}
      {...props}
    />
  );
}

export { Skeleton };
