import { cn } from "@/lib/cn";

interface CardProps {
  title?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Card({ title, className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4",
        className,
      )}
    >
      {title ? (
        <div className="mb-3 text-[13px] font-semibold tracking-wide text-text">
          {title}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function Row({
  className,
  onClick,
  children,
}: {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "flex items-center gap-3 border-b border-border/40 py-2.5 last:border-b-0",
        onClick && "cursor-pointer hover:bg-card2/40",
        className,
      )}
    >
      {children}
    </div>
  );
}
