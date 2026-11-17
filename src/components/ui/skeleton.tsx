import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl border border-border-light/80 bg-muted",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
