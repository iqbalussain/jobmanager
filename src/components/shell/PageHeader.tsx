import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Visible title bars were removed for a native-app feel; the title stays for screen readers and actions stay visible. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <>
      <h1 className="sr-only">{title}{description ? <> — {description}</> : null}</h1>
      {actions && (
        <header className={cn("flex min-w-0 flex-wrap items-center justify-end gap-2", className)}>
          {actions}
        </header>
      )}
    </>
  );
}
